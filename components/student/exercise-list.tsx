'use client';

import { useEffect, useState } from 'react';
import { ExerciseView } from './exercise-view';
import { Card } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';

interface QuizOption {
  id: string;
  text: string;
  order: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE' | 'FILE_UPLOAD';
  points: number;
  options: QuizOption[];
  submissions: Array<{
    id: string;
    answer: string;
    isCorrect: boolean | null;
    score: number | null;
    feedback: string | null;
  }>;
}

interface ExerciseListProps {
  courseId: string;
}

export function ExerciseList({ courseId }: ExerciseListProps) {
  const { t } = useTranslation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchExercises();
  }, [courseId]);

  const fetchExercises = async () => {
    try {
      const response = await fetch(`/api/exercises?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateProgress = () => {
    if (exercises.length === 0) return { completed: 0, total: 0, percentage: 0 };

    const completed = exercises.filter(
      (ex) => ex.submissions.length > 0
    ).length;

    return {
      completed,
      total: exercises.length,
      percentage: Math.round((completed / exercises.length) * 100),
    };
  };

  const calculateScore = () => {
    const totalPoints = exercises.reduce((sum, ex) => sum + ex.points, 0);
    const earnedPoints = exercises.reduce((sum, ex) => {
      const submission = ex.submissions[0];
      return sum + (submission?.score || 0);
    }, 0);

    return {
      earned: earnedPoints,
      total: totalPoints,
      percentage: totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0,
    };
  };

  if (isLoading) {
    return <div className="text-center py-8">{t('exercises.loading')}</div>;
  }

  if (exercises.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          {t('exercises.empty')}
        </p>
      </Card>
    );
  }

  const progress = calculateProgress();
  const score = calculateScore();

  return (
    <div className="space-y-6">
      {/* Progress Stats */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('exercises.progressTitle')}</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Completion */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('exercises.exercisesCompleted')}</span>
              <span className="text-sm font-semibold">
                {progress.completed} / {progress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>

          {/* Score */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('exercises.totalScore')}</span>
              <span className="text-sm font-semibold">
                {t('exercises.scoreSummary', {
                  earned: score.earned,
                  total: score.total,
                  percentage: score.percentage,
                })}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: `${score.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Exercise List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('exercises.title')}</h3>
        {exercises.map((exercise, index) => (
          <div key={exercise.id}>
            {/* Exercise Header */}
            <div
              onClick={() =>
                setExpandedId(expandedId === exercise.id ? null : exercise.id)
              }
              className="p-4 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{exercise.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t(`exercises.type.${exercise.type}`)} • {t('exercises.pointsLabel', { points: exercise.points })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {exercise.submissions.length > 0 && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      {exercise.submissions[0].isCorrect !== null
                        ? exercise.submissions[0].isCorrect
                          ? t('exercises.correctStatus')
                          : t('exercises.incorrectStatus')
                        : t('exercises.submittedStatus')}
                    </span>
                  )}
                  <svg
                    className={`w-5 h-5 transition-transform ${
                      expandedId === exercise.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Expanded Exercise View */}
            {expandedId === exercise.id && (
              <div className="mt-2">
                <ExerciseView
                  exercise={exercise}
                  onSubmit={fetchExercises}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
