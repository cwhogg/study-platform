interface ConsentContentProps {
  content: string
}

type ContentBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'subheader'; text: string }

/**
 * Parses and renders consent document content with proper formatting.
 * Handles bullet lists, bold text, and sub-headers.
 */
export function ConsentContent({ content }: ConsentContentProps) {
  const blocks = parseContent(content)

  return (
    <div className="space-y-4">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'subheader':
            return (
              <p key={idx} className="font-medium text-slate-800 mt-4 mb-1">
                {renderInlineFormatting(block.text)}
              </p>
            )
          case 'list':
            return (
              <ul key={idx} className="space-y-2 ml-1">
                {block.items.map((item, itemIdx) => (
                  <li key={itemIdx} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 flex-shrink-0" />
                    <span className="text-slate-700 leading-relaxed">
                      {renderInlineFormatting(item)}
                    </span>
                  </li>
                ))}
              </ul>
            )
          case 'paragraph':
          default:
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {renderInlineFormatting(block.text)}
              </p>
            )
        }
      })}
    </div>
  )
}

/**
 * Parses content string into structured blocks.
 */
function parseContent(content: string): ContentBlock[] {
  const blocks: ContentBlock[] = []
  const lines = content.split('\n')

  let i = 0
  while (i < lines.length) {
    const line = lines[i].trim()

    // Skip empty lines
    if (!line) {
      i++
      continue
    }

    // Check if this is a bullet point
    if (isBulletLine(line)) {
      const listItems: string[] = []

      // Collect consecutive bullet lines
      while (i < lines.length && isBulletLine(lines[i].trim())) {
        const bulletText = extractBulletText(lines[i].trim())
        if (bulletText) {
          listItems.push(bulletText)
        }
        i++
      }

      if (listItems.length > 0) {
        blocks.push({ type: 'list', items: listItems })
      }
      continue
    }

    // Check if this is a sub-header (line ending with : and followed by bullet or empty)
    if (isSubheader(line, lines, i)) {
      blocks.push({ type: 'subheader', text: line })
      i++
      continue
    }

    // Collect paragraph text (including lines until we hit a bullet, subheader, or double newline)
    let paragraphText = line
    i++

    while (i < lines.length) {
      const nextLine = lines[i].trim()

      // Stop at empty line (paragraph break)
      if (!nextLine) {
        i++
        break
      }

      // Stop at bullet or subheader
      if (isBulletLine(nextLine) || isSubheader(nextLine, lines, i)) {
        break
      }

      // Add to paragraph
      paragraphText += '\n' + nextLine
      i++
    }

    blocks.push({ type: 'paragraph', text: paragraphText })
  }

  return blocks
}

/**
 * Checks if a line is a bullet point.
 */
function isBulletLine(line: string): boolean {
  return /^[•\-\*]\s/.test(line)
}

/**
 * Extracts text content from a bullet line.
 */
function extractBulletText(line: string): string {
  return line.replace(/^[•\-\*]\s*/, '').trim()
}

/**
 * Checks if a line is a sub-header (ends with : and next non-empty line is bullet or nothing).
 */
function isSubheader(line: string, lines: string[], currentIndex: number): boolean {
  if (!line.endsWith(':')) return false

  // Look at the next non-empty line
  for (let j = currentIndex + 1; j < lines.length; j++) {
    const nextLine = lines[j].trim()
    if (!nextLine) continue
    // If next content is a bullet, this is a subheader
    return isBulletLine(nextLine)
  }

  // End of content - could be subheader
  return true
}

/**
 * Renders inline formatting like **bold** text.
 */
function renderInlineFormatting(text: string): React.ReactNode {
  // Split by bold markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const boldText = part.slice(2, -2)
      return (
        <strong key={idx} className="font-semibold text-slate-900">
          {boldText}
        </strong>
      )
    }
    return part
  })
}

export default ConsentContent
