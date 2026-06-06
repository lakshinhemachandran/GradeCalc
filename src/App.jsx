import { useMemo, useState } from 'react'
import './App.css'
import { parseGradebookFallback, parseGradebookWithAI } from './gradebookParser'

const createPendingAssignment = () => ({
  id: `pending-${crypto.randomUUID()}`,
  name: '',
  earned: '',
  possible: '',
})

const parseValue = (value) => {
  const numeric = Number.parseFloat(value)
  return Number.isFinite(numeric) ? numeric : 0
}

function App() {
  const [className, setClassName] = useState('')
  const [gradebookText, setGradebookText] = useState('')
  const [parsedAssignments, setParsedAssignments] = useState([])
  const [pendingAssignments, setPendingAssignments] = useState([createPendingAssignment()])
  const [status, setStatus] = useState('Paste your gradebook and parse it to begin.')
  const [parserMode, setParserMode] = useState('fallback')
  const [isParsing, setIsParsing] = useState(false)

  const currentGrade = useMemo(() => {
    const totals = parsedAssignments
      .filter((assignment) => assignment.includeInAverage && assignment.possible > 0)
      .reduce(
        (acc, assignment) => {
          acc.earned += assignment.earned
          acc.possible += assignment.possible
          return acc
        },
        { earned: 0, possible: 0 },
      )

    if (!totals.possible) {
      return null
    }

    return (totals.earned / totals.possible) * 100
  }, [parsedAssignments])

  const projectedGrade = useMemo(() => {
    const gradedTotals = parsedAssignments
      .filter((assignment) => assignment.includeInAverage && assignment.possible > 0)
      .reduce(
        (acc, assignment) => {
          acc.earned += assignment.earned
          acc.possible += assignment.possible
          return acc
        },
        { earned: 0, possible: 0 },
      )

    const pendingTotals = pendingAssignments.reduce(
      (acc, assignment) => {
        acc.earned += parseValue(assignment.earned)
        acc.possible += parseValue(assignment.possible)
        return acc
      },
      { earned: 0, possible: 0 },
    )

    const totalEarned = gradedTotals.earned + pendingTotals.earned
    const totalPossible = gradedTotals.possible + pendingTotals.possible

    if (!totalPossible) {
      return null
    }

    return (totalEarned / totalPossible) * 100
  }, [parsedAssignments, pendingAssignments])

  const handleParse = async () => {
    if (!gradebookText.trim()) {
      setStatus('Please paste your gradebook text first.')
      return
    }

    setIsParsing(true)

    try {
      if (parserMode === 'ai') {
        const aiResult = await parseGradebookWithAI(gradebookText)
        setParsedAssignments(aiResult.assignments)

        if (!className && aiResult.className) {
          setClassName(aiResult.className)
        }

        setStatus(`AI parsed ${aiResult.assignments.length} assignments.`)
      } else {
        const fallbackResult = parseGradebookFallback(gradebookText)
        setParsedAssignments(fallbackResult)
        setStatus(`Parsed ${fallbackResult.length} assignments with local parser.`)
      }
    } catch (error) {
      const fallbackResult = parseGradebookFallback(gradebookText)
      setParsedAssignments(fallbackResult)
      setStatus(`AI parser failed (${error.message}). Used local parser and found ${fallbackResult.length} assignments.`)
    } finally {
      setIsParsing(false)
    }
  }

  const updateParsed = (id, key, value) => {
    setParsedAssignments((current) =>
      current.map((assignment) =>
        assignment.id === id
          ? {
              ...assignment,
              [key]: key === 'includeInAverage' ? value : key === 'earned' || key === 'possible' ? parseValue(value) : value,
            }
          : assignment,
      ),
    )
  }

  const updatePending = (id, key, value) => {
    setPendingAssignments((current) =>
      current.map((assignment) => (assignment.id === id ? { ...assignment, [key]: value } : assignment)),
    )
  }

  const addPendingAssignment = () => {
    setPendingAssignments((current) => [...current, createPendingAssignment()])
  }

  const removePendingAssignment = (id) => {
    setPendingAssignments((current) => (current.length > 1 ? current.filter((item) => item.id !== id) : current))
  }

  return (
    <main className="page">
      <header className="hero">
        <h1>GradeCalc</h1>
        <p>
          Paste your gradebook once, auto-parse your current assignments, then add only the few grades that are still missing.
        </p>
      </header>

      <section className="card">
        <h2>1) Paste Gradebook</h2>
        <label htmlFor="className">Class Name</label>
        <input
          id="className"
          type="text"
          value={className}
          onChange={(event) => setClassName(event.target.value)}
          placeholder="Spanish I"
        />

        <label htmlFor="gradebookPaste">Gradebook Text</label>
        <textarea
          id="gradebookPaste"
          value={gradebookText}
          onChange={(event) => setGradebookText(event.target.value)}
          placeholder="Paste your full gradebook export here..."
        />

        <div className="controls">
          <label className="inline-control" htmlFor="fallback-mode">
            <input
              id="fallback-mode"
              type="radio"
              name="parser-mode"
              checked={parserMode === 'fallback'}
              onChange={() => setParserMode('fallback')}
            />
            Local parser
          </label>
          <label className="inline-control" htmlFor="ai-mode">
            <input id="ai-mode" type="radio" name="parser-mode" checked={parserMode === 'ai'} onChange={() => setParserMode('ai')} />
            AI parser (Puter.js)
          </label>
          <button type="button" onClick={handleParse} disabled={isParsing}>
            {isParsing ? 'Parsing...' : 'Parse Gradebook'}
          </button>
        </div>

        <p className="status">{status}</p>
      </section>

      <section className="card">
        <h2>2) Confirm Parsed Assignments</h2>
        {parsedAssignments.length === 0 ? (
          <p className="empty">No assignments parsed yet.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Use</th>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Earned</th>
                  <th>Possible</th>
                </tr>
              </thead>
              <tbody>
                {parsedAssignments.map((assignment) => (
                  <tr key={assignment.id}>
                    <td>
                      <input
                        type="checkbox"
                        checked={assignment.includeInAverage}
                        onChange={(event) => updateParsed(assignment.id, 'includeInAverage', event.target.checked)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={assignment.date}
                        onChange={(event) => updateParsed(assignment.id, 'date', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={assignment.name}
                        onChange={(event) => updateParsed(assignment.id, 'name', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={assignment.category}
                        onChange={(event) => updateParsed(assignment.id, 'category', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={assignment.earned}
                        onChange={(event) => updateParsed(assignment.id, 'earned', event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={assignment.possible}
                        onChange={(event) => updateParsed(assignment.id, 'possible', event.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card">
        <h2>3) Add Missing Assignments</h2>
        <div className="pending-list">
          {pendingAssignments.map((assignment) => (
            <div className="pending-row" key={assignment.id}>
              <input
                type="text"
                value={assignment.name}
                onChange={(event) => updatePending(assignment.id, 'name', event.target.value)}
                placeholder="Assignment name"
              />
              <input
                type="number"
                step="0.01"
                value={assignment.earned}
                onChange={(event) => updatePending(assignment.id, 'earned', event.target.value)}
                placeholder="Earned"
              />
              <input
                type="number"
                step="0.01"
                value={assignment.possible}
                onChange={(event) => updatePending(assignment.id, 'possible', event.target.value)}
                placeholder="Possible"
              />
              <button type="button" className="remove" onClick={() => removePendingAssignment(assignment.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
        <button type="button" className="secondary" onClick={addPendingAssignment}>
          + Add Missing Assignment
        </button>
      </section>

      <section className="card result-card">
        <h2>Projected Grade</h2>
        <p className="result-name">{className || 'Your Class'}</p>
        <div className="grade-grid">
          <div>
            <span>Current</span>
            <strong>{currentGrade === null ? '--' : `${currentGrade.toFixed(2)}%`}</strong>
          </div>
          <div>
            <span>Projected</span>
            <strong>{projectedGrade === null ? '--' : `${projectedGrade.toFixed(2)}%`}</strong>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
