'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import Image from 'next/image';
import Link from 'next/link';

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
}

interface ResultData {
  id: number;
  score: number;
  created_at: string;
  selected_answers: Record<number, string>;
  correct_answers: Record<number, string>;
  time_taken?: number;
  questions_data?: Record<number, Question>;
}

export default function ResultsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [feedbackLocked, setFeedbackLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      const { data: resultData } = await supabase.from('results').select('*').eq('id', id).single();
      setResult(resultData);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const uid = user.id;
      setUserId(uid);

      const { count } = await supabase
        .from('results')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', uid);

      setAttemptCount(count || 0);

      const { data: feedback } = await supabase
        .from('testimonials')
        .select('*')
        .eq('user_id', uid)
        .single();

      if (feedback) {
        setExistingFeedback(feedback);
        setComment(feedback.message);
        setRating(feedback.rating);
        setSubmitted(true);
        setFeedbackLocked(feedback.locked || false);
      }

      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleSubmitFeedback = async () => {
    if (!userId || !comment || rating === 0) return;

    if (existingFeedback && feedbackLocked) return; // Can't edit if locked

    if (rating < 4) {
      await supabase.from('dev_feedback').insert({ user_id: userId, message: comment, rating });
    }

    if (existingFeedback) {
      await supabase
        .from('testimonials')
        .update({ message: comment, rating, locked: true })
        .eq('user_id', userId);
    } else {
      await supabase.from('testimonials').insert({
        name: 'Anonymous',
        message: comment,
        rating,
        user_id: userId,
        locked: true,
      });
    }

    setSubmitted(true);
    setShowConfirm(false);
    setFeedbackLocked(true);
  };

  if (loading || !result) return <div className="p-6 text-center">Loading...</div>;

  const { score, selected_answers, correct_answers, time_taken, questions_data } = result;

  const passed = score >= 90;
  const correctCount = Object.entries(correct_answers).filter(
    ([qid, ans]) => selected_answers?.[Number(qid)] === ans
  ).length;
  const incorrectCount = Object.keys(correct_answers).length - correctCount;

  const pieData = {
    labels: ['Correct', 'Incorrect'],
    datasets: [{ data: [correctCount, incorrectCount], backgroundColor: ['#10B981', '#EF4444'] }],
  };

  const barData = {
    labels: ['Score'],
    datasets: [{ label: 'Percentage', data: [score], backgroundColor: passed ? '#10B981' : '#EF4444' }],
  };

  const labelToText = (q: Question, label: string) => {
    return q[`option_${label.toLowerCase()}` as keyof Question] as string;
  };

  const shouldForceFeedback = attemptCount >= 3 && !submitted;
  const disableExam = shouldForceFeedback;

  return (
    <div className="min-h-screen bg-[#1B264F] text-white p-6">
      <div className="max-w-3xl mx-auto bg-white text-[#1B264F] rounded-xl shadow p-6 text-center">
        <Link href="explore"><Image src='/image/Logo.png' alt='Logo' width={60} height={60}/></Link>
        <h1 className="text-3xl font-bold mb-4">Exam Results</h1>

        <p className={`text-lg font-semibold mb-2 ${passed ? 'text-green-600' : 'text-red-600'}`}>
          {passed ? '✅ Congratulations! You Passed!' : '❌ You Failed. Review your mistakes below.'}
        </p>

        <p className="mb-2">Score: <strong>{score.toFixed(2)}%</strong></p>
        {typeof time_taken === 'number' && (
          <p className="mb-4 text-sm text-gray-600">
            Time Taken: {Math.floor(time_taken / 60)}m {time_taken % 60}s
          </p>
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

        <p className="mt-4 text-sm text-gray-600">
          Exam Attempts Today: <strong>{attemptCount}/5</strong>
        </p>
        <Link href='/notes'><button className='bg-[#1B264F] text-white px-4 py-2 rounded hover:bg-[#302B27]'>Back notes</button></Link>

        <div className="flex flex-wrap justify-center gap-4 mt-6">
          <button
            onClick={() => router.push('/exam')}
            disabled={disableExam}
            className={`px-4 py-2 rounded text-white ${disableExam ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
          >
            ✅ Retake Exam
          </button>
          <h2 className='text-red-600'>NB:Need to leave a comment and rating to be able to continue to take the exam </h2>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 px-4 py-2 bg-[#1B264F] text-white rounded hover:bg-[#1B299F]"
        >
          {expanded ? 'Hide Review' : 'Review Answers'}
        </button>

        {expanded && (
          <div className="mt-6 space-y-4 text-left">
            {Object.entries(correct_answers).map(([qidStr, correctAns], index) => {
              const qid = Number(qidStr);
              const question = questions_data?.[qid];
              const userAnswer = selected_answers?.[qid];
              const isCorrect = userAnswer === correctAns;

              return (
                <div key={qid} className="border p-4 rounded-md bg-white shadow-sm">
                  <p className="mb-1"><strong>Q{index + 1}:</strong> {question?.question}</p>
                  <p className={`text-sm mt-1 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    Your Answer: <strong>{userAnswer || 'Not Answered'}</strong>{' '}
                    {userAnswer && question && ` - ${labelToText(question, userAnswer)}`}
                  </p>
                  {!isCorrect && question && (
                    <p className="text-sm text-gray-800">
                      Correct: <strong>{correctAns}</strong> - {labelToText(question, correctAns)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {(shouldForceFeedback || !submitted || (submitted && !feedbackLocked)) && (
          <div className="mt-10 bg-[#f9fafb] rounded-xl p-6 text-left shadow">
            <h2 className="text-xl font-bold mb-4 text-[#1B264F]">Your Thoughts Matter</h2>

            <label className="block mb-2 font-semibold">Rate the Exam:</label>
            <div className="flex space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={`text-2xl cursor-pointer ${rating >= s ? 'text-yellow-500' : 'text-gray-300'}`}
                  onClick={() => !feedbackLocked && setRating(s)}
                >
                  ★
                </span>
              ))}
            </div>

            <label className="block mb-2 font-semibold">Your feedback:</label>
            <textarea
              value={comment}
              onChange={(e) => !feedbackLocked && setComment(e.target.value)}
              className="w-full border rounded p-2 text-sm text-black mb-4"
              rows={4}
              placeholder="How was the exam experience? Suggestions to improve?"
            />

            <button
              onClick={() => setShowConfirm(true)}
              disabled={!comment || rating === 0 || feedbackLocked}
              className="bg-[#1B264F] text-white px-6 py-2 rounded hover:bg-[#1B299F] disabled:opacity-50"
            >
              {existingFeedback ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </div>
        )}

        {showConfirm && (
          <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded shadow-lg text-center w-[90%] md:w-[400px]">
              <h2 className="text-xl font-bold text-[#1B264F] mb-4">Confirm Feedback</h2>
              <p className="text-sm text-gray-700 mb-4">
                Are you sure you want to {existingFeedback ? 'update' : 'submit'} this feedback?
              </p>
              <div className="flex justify-center gap-4">
                <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmitFeedback}>
                  Yes
                </button>
                <button className="bg-gray-300 px-4 py-2 rounded" onClick={() => setShowConfirm(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {submitted && !shouldForceFeedback && (
          <p className="text-green-600 mt-4 font-semibold">✅ Thank you! Your feedback was submitted.</p>
        )}
      </div>
    </div>
  );
}
