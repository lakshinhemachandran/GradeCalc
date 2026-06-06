import { puter } from '@heyputer/puter.js'

const parseNumber = (value) => {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const sanitizeAssignment = (assignment, index) => {
  const earned = parseNumber(assignment.earned)
  const possible = parseNumber(assignment.possible)

  return {
    id: `parsed-${index}-${Date.now()}`,
    date: assignment.date?.toString().trim() ?? '',
    name: assignment.name?.toString().trim() || `Assignment ${index + 1}`,
    category: assignment.category?.toString().trim() || 'Uncategorized',
    earned,
    possible,
    includeInAverage: possible > 0,
  }
}

const pullJson = (rawResponse) => {
  if (!rawResponse) {
    return null
  }

  if (typeof rawResponse === 'string') {
    const bracketed = rawResponse.match(/\{[\s\S]*\}/)
    if (!bracketed) {
      return null
    }

    return JSON.parse(bracketed[0])
  }

  if (typeof rawResponse?.text === 'string') {
    return pullJson(rawResponse.text)
  }

  return null
}

export const parseGradebookFallback = (input) => {
  const lines = input
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  const assignments = []

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i]
    const scoreMatch = line.match(/([\d.]+)\s+out of\s+([\d.]+)/i)

    if (!scoreMatch) {
      continue
    }

    const earned = parseNumber(scoreMatch[1])
    const possible = parseNumber(scoreMatch[2])

    let name = 'Assignment'
    let category = 'Uncategorized'
    let date = ''

    for (let j = i - 1; j >= 0 && j >= i - 4; j -= 1) {
      const candidate = lines[j]

      if (!date && /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(candidate)) {
        date = candidate
        continue
      }

      if (
        candidate &&
        !candidate.match(/^(Raw Score|Assignments|Totals|Search\.\.\.|Data grid)/i) &&
        !candidate.match(/^[A-F][+-]?$/i) &&
        !candidate.match(/^\d+(\.\d+)?%$/)
      ) {
        if (name === 'Assignment') {
          name = candidate
        } else if (category === 'Uncategorized') {
          category = candidate
        }
      }
    }

    assignments.push({ date, name, category, earned, possible })
  }

  return assignments.map(sanitizeAssignment)
}

export const parseGradebookWithAI = async (input) => {
  if (!puter?.ai?.chat) {
    throw new Error('Puter AI is unavailable in this browser session.')
  }

  const prompt = `Extract assignments from this gradebook text and return STRICT JSON only in this exact shape: {"className":"...","assignments":[{"date":"MM/DD/YY or empty","name":"...","category":"...","earned":0,"possible":0}]}. Keep only graded items with numeric earned and possible values. Text:\n\n${input}`

  const response = await puter.ai.chat(prompt, { model: 'gpt-5.4-mini' })
  const parsed = pullJson(response)

  if (!parsed || !Array.isArray(parsed.assignments)) {
    throw new Error('AI parser returned an unexpected format.')
  }

  return {
    className: parsed.className?.toString().trim() ?? '',
    assignments: parsed.assignments.map(sanitizeAssignment),
  }
}
