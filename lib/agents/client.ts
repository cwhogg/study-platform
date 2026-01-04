/**
 * Agent Client
 *
 * Functions to load agent instructions and call OpenAI with proper configuration.
 */

import OpenAI from 'openai'
import { readFileSync } from 'fs'
import path from 'path'
import type {
  AgentName,
  AgentModel,
  AgentCallOptions,
  AgentResult,
  DiscoveryInput,
  DiscoveryOutput,
  ProtocolGenerationInput,
  ProtocolGenerationOutput,
  ConsentGenerationInput,
  ConsentGenerationOutput,
} from './types'

// Lazy-initialize OpenAI client to avoid build-time errors
let openaiClient: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openaiClient
}

// Default model mappings per agent
const DEFAULT_MODELS: Record<AgentName, AgentModel> = {
  'clinical-protocol': 'o1-mini',
  'consent-compliance': 'gpt-4o',
  'enrollment': 'gpt-4o',
  'patient-communication': 'gpt-4o',
}

/**
 * Load agent instruction file from /agents/[name]/AGENT.md
 */
export function loadAgentInstructions(agentName: AgentName): string {
  const agentPath = path.join(process.cwd(), 'agents', agentName, 'AGENT.md')
  try {
    return readFileSync(agentPath, 'utf-8')
  } catch (error) {
    console.error(`Failed to load agent instructions for ${agentName}:`, error)
    throw new Error(`Agent instructions not found: ${agentName}`)
  }
}

/**
 * Call an agent with the given input
 *
 * @param agentName - The agent to call (e.g., 'clinical-protocol')
 * @param input - The input data for the agent
 * @param options - Optional configuration (model override, temperature)
 * @returns AgentResult with parsed JSON response
 */
export async function callAgent<TInput, TOutput>(
  agentName: AgentName,
  input: TInput,
  options?: AgentCallOptions
): Promise<AgentResult<TOutput>> {
  const model = options?.model || DEFAULT_MODELS[agentName]
  const systemPrompt = loadAgentInstructions(agentName)
  const userMessage = JSON.stringify(input)

  console.log(`[Agent] Calling ${agentName} with model ${model}`)
  console.log(`[Agent] Input:`, JSON.stringify(input, null, 2))

  try {
    let response: OpenAI.Chat.Completions.ChatCompletion

    const openai = getOpenAI()

    // o1 models have different API requirements:
    // - No system messages, use developer role or include in user message
    // - No temperature parameter
    // - No response_format for JSON
    if (model === 'o1-mini') {
      response = await openai.chat.completions.create({
        model,
        messages: [
          {
            role: 'user',
            content: `${systemPrompt}\n\n---\n\nPlease process the following request and return your response as valid JSON:\n\n${userMessage}`,
          },
        ],
      })
    } else {
      // gpt-4o and similar models
      response = await openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        response_format: { type: 'json_object' },
        temperature: options?.temperature ?? 0.7,
      })
    }

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[Agent] Empty response from OpenAI')
      return {
        success: false,
        error: 'Empty response from agent',
      }
    }

    console.log(`[Agent] Raw response:`, content.substring(0, 500) + '...')

    // Parse JSON response
    // For o1 models, the response might be wrapped in markdown code blocks
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
    }

    const data = JSON.parse(jsonContent) as TOutput

    console.log(`[Agent] Successfully parsed response`)

    return {
      success: true,
      data,
      usage: response.usage
        ? {
            promptTokens: response.usage.prompt_tokens,
            completionTokens: response.usage.completion_tokens,
            totalTokens: response.usage.total_tokens,
          }
        : undefined,
    }
  } catch (error) {
    console.error(`[Agent] Error calling ${agentName}:`, error)

    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Failed to parse agent response as JSON',
      }
    }

    if (error instanceof OpenAI.APIError) {
      return {
        success: false,
        error: `OpenAI API error: ${error.message}`,
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// =============================================================================
// Typed Agent Call Helpers
// =============================================================================

/**
 * Call the Clinical Protocol Agent for study discovery
 */
export async function discoverStudy(
  intervention: string
): Promise<AgentResult<DiscoveryOutput>> {
  const input: DiscoveryInput = {
    task: 'discover',
    intervention,
  }
  return callAgent<DiscoveryInput, DiscoveryOutput>('clinical-protocol', input, {
    model: 'o1-mini',
  })
}

/**
 * Call the Clinical Protocol Agent for protocol generation
 */
export async function generateProtocol(
  input: Omit<ProtocolGenerationInput, 'task'>
): Promise<AgentResult<ProtocolGenerationOutput>> {
  const fullInput: ProtocolGenerationInput = {
    task: 'generate',
    ...input,
  }
  return callAgent<ProtocolGenerationInput, ProtocolGenerationOutput>(
    'clinical-protocol',
    fullInput,
    { model: 'o1-mini' }
  )
}

/**
 * Call the Consent & Compliance Agent for consent document generation
 */
export async function generateConsent(
  input: ConsentGenerationInput
): Promise<AgentResult<ConsentGenerationOutput>> {
  return callAgent<ConsentGenerationInput, ConsentGenerationOutput>(
    'consent-compliance',
    input,
    { model: 'gpt-4o' }
  )
}
