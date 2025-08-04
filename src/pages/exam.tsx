// pages/exam.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';

interface Question {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  image_path: string | null;
}

const SUPABASE_PROJECT_ID = 'xgahvkjbspjbgoiijnzz';
const PUBLIC_BUCKET_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co/storage/v1/object/public/exam-media`;

export default function ExamPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [timer, setTimer] = useState(8 * 60);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [finished, setFinished] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!user?.id) return;

      let excludeIds: number[] = [];
      const { data: previousResults } = await supabase
        .from('results')
        .select('question_ids')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (previousResults) {
        excludeIds = previousResults.flatMap(r => r.question_ids);
      }

      const { data, error } = await supabase
        .from('exam-questions')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',') || 0})`)
        .order('id')
        .limit(25);

      if (error) {
        console.error('❌ Failed to fetch questions:', error);
        return;
      }

      setQuestions(data || []);
      setStartTime(Date.now());
    };

    fetchQuestions();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(prev => {
        if (prev === 1) {
          clearInterval(interval);
          handleFinishExam();
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [questions]);

  const handleAnswerSelect = (value: string) => {
    const currentQuestion = questions[currentQuestionIndex];
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    setImageError(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setImageError(false);
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleFinishExam = async () => {
    let correct = 0;
    const questionIds: number[] = [];
    const selected: Record<number, string> = {};
    const corrects: Record<number, string> = {};
    const fullQuestionMap: Record<number, Omit<Question, 'image_path'>> = {};

    questions.forEach(q => {
      questionIds.push(q.id);
      selected[q.id] = selectedAnswers[q.id] || '';
      corrects[q.id] = q.correct_answer;
      fullQuestionMap[q.id] = {
        id: q.id,
        question: q.question,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_answer: q.correct_answer
      };
      if (selected[q.id] === q.correct_answer) correct++;
    });

    const percentage = (correct / questions.length) * 100;
    setScore(percentage);
    setFinished(true);

    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    const { data, error } = await supabase
      .from('results')
      .insert([{
        user_id: user?.id,
        score: percentage,
        question_ids: questionIds,
        selected_answers: selected,
        correct_answers: corrects,
        questions_data: fullQuestionMap,
        time_taken: timeTaken
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to save results:', error);
      return;
    }

    router.push(`/results?id=${data.id}`);
  };

  const currentQuestion = questions[currentQuestionIndex];
  const cleanImagePath = (currentQuestion?.image_path || '').trim();
  const imageUrl = cleanImagePath ? `${PUBLIC_BUCKET_URL}/${cleanImagePath}` : null;

  if (!currentQuestion) {
    return <div className="p-8 text-center">Loading questions...</div>;
  }

  return (
    <div className="min-h-screen bg-white text-gray-900 p-6">
      {!finished ? (
        <>
          <div className="text-center text-xl font-semibold mb-6">
            <Image src='/image/Logo.png' alt='Logo' width={60} height={60}/>
            Time Left: {Math.floor(timer / 60)}:{String(timer % 60).padStart(2, '0')}
          </div>

          <div className="max-w-4xl mx-auto bg-gray-100 p-6 rounded-xl shadow-lg">
            <h2 className="text-lg font-medium mb-4">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>

            <div className="flex flex-col md:flex-row gap-6 mb-4 items-start">
              {imageUrl && !imageError && (
                <div className="flex-shrink-0 w-full md:w-1/2 flex justify-center">
                  <Image
                    src={imageUrl}
                    alt="Question Image"
                    width={300}
                    height={200}
                    className="object-contain rounded border shadow"
                    onError={() => setImageError(true)}
                    priority
                  />
                </div>
              )}

              <div className="flex-1">
                <p className="text-lg font-semibold mb-2">{currentQuestion.question}</p>
                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map(opt => {
                    const optionValue =
                      currentQuestion[`option_${opt.toLowerCase()}` as keyof Question] as string;
                    const isSelected = selectedAnswers[currentQuestion.id] === opt;

                    return (
                      <div
                        key={opt}
                        className={`p-3 border rounded cursor-pointer ${
                          isSelected ? 'bg-blue-100 border-blue-400' : 'hover:bg-gray-200'
                        }`}
                        onClick={() => handleAnswerSelect(opt)}
                      >
                        <strong>{opt}.</strong> {optionValue}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Previous
              </button>

              {currentQuestionIndex === questions.length - 1 ? (
                <button
                  onClick={handleFinishExam}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Finish Exam
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center mt-20">
          <h2 className="text-2xl font-bold mb-4">🎉 Exam Finished!</h2>
          <p className="text-lg mb-2">Your Score: {score?.toFixed(2)}%</p>
        </div>
      )}
    </div>
  );
}
