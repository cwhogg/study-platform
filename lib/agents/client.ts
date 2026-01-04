/**
 * Agent Client
 *
 * Functions to load agent instructions and call OpenAI with proper configuration.
 */

import OpenAI from 'openai'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'
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

// Enable verbose logging with AGENT_DEBUG=true
const DEBUG = process.env.AGENT_DEBUG === 'true'

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
// Note: o1-mini requires special API access, using gpt-4o for all agents
const DEFAULT_MODELS: Record<AgentName, AgentModel> = {
  'clinical-protocol': 'gpt-4o',
  'consent-compliance': 'gpt-4o',
  'enrollment': 'gpt-4o',
  'patient-communication': 'gpt-4o',
}

/**
 * Log to file for debugging agent calls
 */
function logToFile(filename: string, content: string): void {
  try {
    const logsDir = path.join(process.cwd(), 'logs', 'agents')
    mkdirSync(logsDir, { recursive: true })
    const filepath = path.join(logsDir, filename)
    writeFileSync(filepath, content, 'utf-8')
    console.log(`[Agent] Log written to: ${filepath}`)
  } catch (err) {
    console.error('[Agent] Failed to write log file:', err)
  }
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
  const userMessage = JSON.stringify(input, null, 2)
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const callId = `${agentName}-${timestamp}`

  console.log(`\n${'='.repeat(80)}`)
  console.log(`[Agent] CALL START: ${callId}`)
  console.log(`${'='.repeat(80)}`)
  console.log(`[Agent] Agent: ${agentName}`)
  console.log(`[Agent] Model: ${model}`)
  console.log(`[Agent] Temperature: ${options?.temperature ?? 0.7}`)
  console.log(`[Agent] System Prompt Length: ${systemPrompt.length} chars`)
  console.log(`[Agent] User Message Length: ${userMessage.length} chars`)

  console.log(`\n[Agent] === USER MESSAGE (INPUT) ===`)
  console.log(userMessage)
  console.log(`[Agent] === END USER MESSAGE ===\n`)

  // Log full details to file if DEBUG is enabled
  if (DEBUG) {
    const requestLog = `
AGENT CALL: ${callId}
================================================================================
TIMESTAMP: ${new Date().toISOString()}
AGENT: ${agentName}
MODEL: ${model}
TEMPERATURE: ${options?.temperature ?? 0.7}

================================================================================
SYSTEM PROMPT (${systemPrompt.length} chars):
================================================================================
${systemPrompt}

================================================================================
USER MESSAGE (${userMessage.length} chars):
================================================================================
${userMessage}
`
    logToFile(`${callId}-request.txt`, requestLog)
  }

  try {
    let response: OpenAI.Chat.Completions.ChatCompletion

    const openai = getOpenAI()

    console.log(`[Agent] Sending request to OpenAI...`)
    const startTime = Date.now()

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

    const elapsed = Date.now() - startTime
    console.log(`[Agent] Response received in ${elapsed}ms`)

    const content = response.choices[0]?.message?.content
    if (!content) {
      console.error('[Agent] Empty response from OpenAI')
      return {
        success: false,
        error: 'Empty response from agent',
      }
    }

    // Log token usage
    if (response.usage) {
      console.log(`[Agent] Token Usage:`)
      console.log(`  - Prompt tokens: ${response.usage.prompt_tokens}`)
      console.log(`  - Completion tokens: ${response.usage.completion_tokens}`)
      console.log(`  - Total tokens: ${response.usage.total_tokens}`)
    }

    console.log(`\n[Agent] === RAW RESPONSE (${content.length} chars) ===`)
    console.log(content)
    console.log(`[Agent] === END RAW RESPONSE ===\n`)

    // Log response to file if DEBUG is enabled
    if (DEBUG) {
      const responseLog = `
AGENT RESPONSE: ${callId}
================================================================================
TIMESTAMP: ${new Date().toISOString()}
ELAPSED: ${elapsed}ms
TOKEN USAGE:
  - Prompt: ${response.usage?.prompt_tokens || 'N/A'}
  - Completion: ${response.usage?.completion_tokens || 'N/A'}
  - Total: ${response.usage?.total_tokens || 'N/A'}

================================================================================
RAW RESPONSE (${content.length} chars):
================================================================================
${content}
`
      logToFile(`${callId}-response.txt`, responseLog)
    }

    // Parse JSON response
    // For o1 models, the response might be wrapped in markdown code blocks
    let jsonContent = content
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonMatch) {
      jsonContent = jsonMatch[1].trim()
      console.log(`[Agent] Extracted JSON from markdown code block`)
    }

    let data: TOutput
    try {
      data = JSON.parse(jsonContent) as TOutput
      console.log(`[Agent] Successfully parsed JSON response`)
    } catch (parseError) {
      console.error(`[Agent] JSON Parse Error:`, parseError)
      console.error(`[Agent] Failed to parse content:`, jsonContent.substring(0, 500))

      if (DEBUG) {
        logToFile(`${callId}-parse-error.txt`, `
PARSE ERROR: ${callId}
================================================================================
ERROR: ${parseError}

CONTENT ATTEMPTED TO PARSE:
================================================================================
${jsonContent}
`)
      }

      return {
        success: false,
        error: `Failed to parse agent response as JSON: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`,
      }
    }

    console.log(`[Agent] CALL SUCCESS: ${callId}`)
    console.log(`${'='.repeat(80)}\n`)

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
    console.error(`\n[Agent] CALL FAILED: ${callId}`)
    console.error(`[Agent] Error Type: ${error?.constructor?.name}`)
    console.error(`[Agent] Error:`, error)

    if (DEBUG) {
      logToFile(`${callId}-error.txt`, `
CALL ERROR: ${callId}
================================================================================
ERROR TYPE: ${error?.constructor?.name}
ERROR: ${error instanceof Error ? error.message : String(error)}
STACK: ${error instanceof Error ? error.stack : 'N/A'}
`)
    }

    if (error instanceof SyntaxError) {
      return {
        success: false,
        error: 'Failed to parse agent response as JSON',
      }
    }

    if (error instanceof OpenAI.APIError) {
      console.error(`[Agent] OpenAI API Error Details:`)
      console.error(`  - Status: ${error.status}`)
      console.error(`  - Message: ${error.message}`)
      console.error(`  - Code: ${error.code}`)
      console.error(`  - Type: ${error.type}`)
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
    model: 'gpt-4o',
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
    { model: 'gpt-4o' }
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
