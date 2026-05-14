import { useEffect, useRef, useState } from 'react'

const TOTAL_QUESTIONS = 20

const promptWords = [
  'Moon',
  'Forest',
  'Sword',
  'Castle',
  'Dream',
  'River',
  'Fire',
  'Storm',
  'Shadow',
  'Crown',
  'Echo',
  'Dragon',
  'Fate',
  'Night',
  'Mirror',
  'Star',
  'Map',
  'Whisper',
  'Secret',
  'Quest',
  'Portal',
  'Rune',
  'Glade',
  'Wind',
  'Tower',
  'Lantern',
  'Trial',
  'Wolf',
]

const commonWords = new Set([
  'love',
  'light',
  'dark',
  'magic',
  'power',
  'fear',
  'hope',
  'war',
  'peace',
  'friend',
  'enemy',
  'dream',
  'night',
  'day',
  'star',
  'fire',
  'water',
  'earth',
  'sky',
  'heart',
])

const fantasyCharacters = {
  wizard: {
    title: 'The Wizard',
    description: 'Your answers are unusual and inventive. You shape language like arcane energy.',
  },
  knight: {
    title: 'The Knight',
    description: 'Your words align closely with shared instincts. You are steady, grounded, and resolute.',
  },
  rogue: {
    title: 'The Rogue',
    description: 'Your responses are swift and concise. You strike fast with instinctive precision.',
  },
}

const shuffle = (values) => {
  const result = [...values]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[result[index], result[swapIndex]] = [result[swapIndex], result[index]]
  }
  return result
}

const scoreWord = (prompt, response) => {
  const normalized = response.trim().toLowerCase()
  const lengthSimilarity = Math.max(0, 100 - Math.abs(prompt.length - normalized.length) * 12)
  const commonality = commonWords.has(normalized) ? 90 : Math.max(25, 70 - normalized.length * 8)
  return Math.round(commonality * 0.65 + lengthSimilarity * 0.35)
}

const calculateResults = (answers) => {
  const totalScore = answers.reduce((sum, answer) => sum + answer.score, 0)
  const averageScore = Math.round(totalScore / answers.length)
  const uncommonCount = answers.filter((answer) => !answer.isCommon).length
  const uncommonRatio = uncommonCount / answers.length
  const averageLength =
    answers.reduce((sum, answer) => sum + answer.response.length, 0) / answers.length

  const character =
    averageLength <= 4
      ? fantasyCharacters.rogue
      : uncommonRatio >= 0.55
        ? fantasyCharacters.wizard
        : fantasyCharacters.knight

  return {
    score: averageScore,
    character,
    uncommonCount,
  }
}

function App() {
  const [phase, setPhase] = useState('landing')
  const [questionSet, setQuestionSet] = useState([])
  const [questionIndex, setQuestionIndex] = useState(0)
  const [answerInput, setAnswerInput] = useState('')
  const [answers, setAnswers] = useState([])
  const [results, setResults] = useState(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const transitionTimerRef = useRef(null)

  useEffect(
    () => () => {
      if (transitionTimerRef.current) {
        clearTimeout(transitionTimerRef.current)
      }
    },
    [],
  )

  const startTest = () => {
    setQuestionSet(shuffle(promptWords).slice(0, TOTAL_QUESTIONS))
    setQuestionIndex(0)
    setAnswerInput('')
    setAnswers([])
    setResults(null)
    setPhase('test')
    setIsTransitioning(false)
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const cleaned = answerInput.trim()
    if (!cleaned || isTransitioning) {
      return
    }

    const prompt = questionSet[questionIndex]
    const score = scoreWord(prompt, cleaned)
    const nextAnswers = [
      ...answers,
      {
        prompt,
        response: cleaned,
        score,
        isCommon: commonWords.has(cleaned.toLowerCase()),
      },
    ]

    setAnswers(nextAnswers)
    setAnswerInput('')
    setIsTransitioning(true)

    transitionTimerRef.current = setTimeout(() => {
      const nextIndex = questionIndex + 1
      if (nextIndex >= TOTAL_QUESTIONS) {
        setResults(calculateResults(nextAnswers))
        setPhase('results')
      } else {
        setQuestionIndex(nextIndex)
      }
      setIsTransitioning(false)
    }, 220)
  }

  const progress = Math.round((questionIndex / TOTAL_QUESTIONS) * 100)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center p-6 text-purple-50 md:p-10">
      <section className="w-full rounded-3xl border border-purple-400/25 bg-slate-950/85 p-6 shadow-[0_0_50px_rgba(98,48,170,0.2)] backdrop-blur transition-all duration-500 md:p-10">
        {phase === 'landing' && (
          <div className="space-y-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-purple-300/80">Word Association Trial</p>
            <h1 className="text-4xl font-bold text-purple-100 md:text-5xl">Enter the Mystic Mind Test</h1>
            <p className="mx-auto max-w-xl text-purple-100/80">
              Respond to 20 prompts with the first word that appears in your mind. Your responses reveal your
              archetype.
            </p>
            <button
              type="button"
              onClick={startTest}
              className="rounded-full border border-purple-300/60 bg-purple-500/20 px-8 py-3 font-semibold text-purple-100 transition hover:-translate-y-0.5 hover:bg-purple-400/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-300"
            >
              Start Test
            </button>
          </div>
        )}

        {phase === 'test' && (
          <div className="space-y-8 transition-all duration-300">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm text-purple-200/80">
                <span>
                  Question {questionIndex + 1} / {TOTAL_QUESTIONS}
                </span>
                <span>{progress}% complete</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-purple-950/90">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div
              className={`rounded-2xl border border-purple-300/20 bg-purple-900/10 p-6 text-center transition-all duration-200 ${
                isTransitioning ? 'translate-y-1 opacity-40' : 'translate-y-0 opacity-100'
              }`}
            >
              <p className="text-xs uppercase tracking-[0.28em] text-purple-300/80">Prompt Word</p>
              <h2 className="mt-3 text-3xl font-bold text-cyan-200">{questionSet[questionIndex]}</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label htmlFor="answer" className="block text-sm text-purple-100/85">
                Type the first word that comes to mind
              </label>
              <input
                id="answer"
                autoFocus
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                placeholder="Your word..."
                className="w-full rounded-xl border border-purple-300/40 bg-slate-900/80 px-4 py-3 text-lg text-purple-50 placeholder:text-purple-200/40 focus:border-cyan-300 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full rounded-xl border border-cyan-300/70 bg-cyan-300/10 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-300/20 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!answerInput.trim()}
              >
                Next Word
              </button>
            </form>
          </div>
        )}

        {phase === 'results' && results && (
          <div className="space-y-8 text-center">
            <p className="text-sm uppercase tracking-[0.35em] text-purple-300/80">Result</p>
            <h2 className="text-4xl font-bold text-cyan-200">{results.character.title}</h2>
            <p className="mx-auto max-w-xl text-purple-100/85">{results.character.description}</p>

            <div className="grid gap-4 text-left md:grid-cols-2">
              <div className="rounded-2xl border border-purple-300/25 bg-purple-800/10 p-5">
                <p className="text-sm text-purple-200/70">Similarity Score</p>
                <p className="mt-1 text-4xl font-bold text-purple-50">{results.score}</p>
              </div>
              <div className="rounded-2xl border border-purple-300/25 bg-purple-800/10 p-5">
                <p className="text-sm text-purple-200/70">Unique Responses</p>
                <p className="mt-1 text-4xl font-bold text-purple-50">{results.uncommonCount}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startTest}
              className="rounded-full border border-purple-300/60 bg-purple-500/20 px-8 py-3 font-semibold text-purple-100 transition hover:-translate-y-0.5 hover:bg-purple-400/30"
            >
              Retake Test
            </button>
          </div>
        )}
      </section>
    </main>
  )
}

export default App
