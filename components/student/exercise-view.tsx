'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface ExerciseViewProps {
  exercise: Exercise;
  onSubmit?: () => void;
}

export function ExerciseView({ exercise, onSubmit }: ExerciseViewProps) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const existingSubmission = exercise.submissions[0];

  const handleSubmit = async () => {
    if (!answer.trim()) {
      setError(t('exercises.answerRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/exercises/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseId: exercise.id,
          answer,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t('exercises.failedToSubmit'));
      }

      const result = await response.json();
      setSubmitted(true);

      if (onSubmit) {
        onSubmit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('exercises.failedToSubmit'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderInput = () => {
    if (existingSubmission) {
      // Show submission result
      return (
        <div className="space-y-4">
          <div className="p-4 rounded-md bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{t('exercises.yourAnswer')}:</span>
              {existingSubmission.isCorrect !== null && (
                <span
                  className={`text-sm font-semibold ${
                    existingSubmission.isCorrect
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  {existingSubmission.isCorrect ? t('exercises.correctStatus') : t('exercises.incorrectStatus')}
                </span>
              )}
            </div>
            {exercise.type === 'MULTIPLE_CHOICE' ? (
              <p className="text-sm">
                {exercise.options.find((opt) => opt.id === existingSubmission.answer)?.text || existingSubmission.answer}
              </p>
            ) : (
              <pre className="text-sm whitespace-pre-wrap">
                {existingSubmission.answer}
              </pre>
            )}
          </div>

          {existingSubmission.score !== null && (
            <div className="p-3 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-100">
              <span className="font-semibold">{t('exercises.scoreLabel')}: </span>
              {t('exercises.pointsSummary', {
                score: existingSubmission.score,
                total: exercise.points,
              })}
            </div>
          )}

          {existingSubmission.feedback && (
            <div className="p-3 rounded-md bg-gray-50 dark:bg-gray-900">
              <span className="text-sm font-medium">{t('exercises.feedback')}:</span>
              <p className="text-sm mt-1">{existingSubmission.feedback}</p>
            </div>
          )}
        </div>
      );
    }

    if (submitted) {
      return (
        <div className="p-4 rounded-md bg-green-50 dark:bg-green-900/20 text-green-900 dark:text-green-100">
          {t('exercises.answerSubmitted')}
        </div>
      );
    }

    switch (exercise.type) {
      case 'MULTIPLE_CHOICE':
        return (
          <div className="space-y-2">
            {exercise.options.map((option) => (
              <label
                key={option.id}
                className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
                  answer === option.id
                    ? 'border-primary bg-primary/5'
                    : 'hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name="answer"
                  value={option.id}
                  checked={answer === option.id}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="mr-3"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        );

      case 'TEXT':
        return (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('exercises.answerPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        );

      case 'CODE':
        return (
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder={t('exercises.codePlaceholder')}
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          />
        );

      case 'FILE_UPLOAD':
        return (
          <div className="p-8 border-2 border-dashed rounded-lg text-center">
            <p className="text-sm text-muted-foreground mb-4">
              {t('exercises.fileUploadUnavailable')}
            </p>
            <input type="file" className="text-sm" />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle>{exercise.title}</CardTitle>
            <CardDescription>{exercise.description}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
              {t(`exercises.type.${exercise.type}`)}
            </span>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
              {t('exercises.pointsLabel', { points: exercise.points })}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <p className="font-medium mb-2">{t('exercises.question')}:</p>
          <p className="whitespace-pre-wrap">{exercise.question}</p>
        </div>

        {renderInput()}

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
            {error}
          </div>
        )}

        {!existingSubmission && !submitted && (
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? t('exercises.submitting') : t('exercises.submitAnswer')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
