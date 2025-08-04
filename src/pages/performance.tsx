import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface ResultData {
  id: number;
  score: number;
  created_at: string;
  selected_answers: Record<string, string>;
  correct_answers: Record<string, string>;
  time_taken?: number;
}

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!id) return;
      const { data, error } = await supabase.from('results').select('*').eq('id', id).single();
      if (error) {
        console.error('Failed to fetch result:', error);
      } else {
        setResult(data);
        if (data.score < 90) {
          setTimeout(() => {
            router.push('/notes');
          }, 4000);
        }
      }
      setLoading(false);
    };
    fetchResult();
  }, [id, router]);

  if (loading || !result) return <div className="p-6 text-center">Loading results...</div>;

  const { score, selected_answers, correct_answers, time_taken } = result;
  const entries = Object.entries(correct_answers || {});
  const correctCount = entries.filter(([qid, ans]) => selected_answers?.[qid] === ans).length;
  const incorrectCount = entries.length - correctCount;
  const passed = score >= 90;

  const pieData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [
      {
        data: [correctCount, incorrectCount],
        backgroundColor: ['#10B981', '#EF4444'],
        borderWidth: 1,
      },
    ],
  };

  const barData = {
    labels: ['Score'],
    datasets: [
      {
        label: 'Percentage',
        data: [score],
        backgroundColor: score >= 90 ? '#10B981' : '#EF4444',
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#1B264F] text-white p-6">
      <div className="max-w-3xl mx-auto bg-white text-[#1B264F] rounded-xl shadow p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Exam Results</h1>

        <p className={`text-lg font-semibold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '✅ Congratulations! You Passed!' : '❌ You Failed. Redirecting to Notes...'}
        </p>

        <p className="mb-2">Score: <strong>{score.toFixed(2)}%</strong></p>
        {typeof time_taken === 'number' && (
          <p className="mb-4 text-sm text-gray-600">Time Taken: {Math.floor(time_taken / 60)}m {time_taken % 60}s</p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">Pie Chart</h2>
            <Pie data={pieData} />
          </div>

          <div className="bg-gray-100 rounded-lg p-4">
            <h2 className="text-lg font-bold mb-2">Score Chart</h2>
            <Bar data={barData} options={{ scales: { y: { beginAtZero: true, max: 100 } } }} />
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 px-4 py-2 bg-[#1B264F] text-white font-bold rounded hover:bg-[#1B299F] transition"
        >
          {expanded ? 'Hide Review' : 'Review Answers'}
        </button>

        {expanded && (
          <div className="mt-6 space-y-4 text-left">
            {entries.map(([qid, correctAnswer], index) => {
              const userAnswer = selected_answers?.[qid];
              const isCorrect = userAnswer === correctAnswer;

              return (
                <div key={qid} className="border p-3 rounded-md bg-white shadow-sm">
                  <p><strong>Q{index + 1}</strong></p>
                  <p className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Your Answer: {(userAnswer as string) || 'Not Answered'}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-gray-800">Correct Answer: {correctAnswer}</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
