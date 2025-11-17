'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

interface Exercise {
  id: string;
  title: string;
  description: string;
  question: string;
  type: 'MULTIPLE_CHOICE' | 'TEXT' | 'CODE' | 'FILE_UPLOAD';
  order: number;
  answer: string | null;
  points: number;
  options: QuizOption[];
}

interface ExerciseManagerProps {
  courseId: string;
}

export function ExerciseManager({ courseId }: ExerciseManagerProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    question: '',
    type: 'MULTIPLE_CHOICE' as Exercise['type'],
    answer: '',
    points: 10,
  });

  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false },
  ]);

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

  const handleAddOption = () => {
    setOptions([...options, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, field: 'text' | 'isCorrect', value: string | boolean) => {
    const newOptions = [...options];
    if (field === 'isCorrect' && value === true) {
      // For multiple choice, only one option can be correct
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index][field] = value as never;
    }
    setOptions(newOptions);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      question: '',
      type: 'MULTIPLE_CHOICE',
      answer: '',
      points: 10,
    });
    setOptions([
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ]);
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleSubmit = async () => {
    try {
      const order = exercises.length;
      const payload: any = {
        ...formData,
        courseId,
        order: editingExercise ? editingExercise.order : order,
      };

      // For multiple choice, include options
      if (formData.type === 'MULTIPLE_CHOICE') {
        payload.options = options.map((opt, index) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
          order: index,
        }));
      }

      const url = editingExercise
        ? `/api/exercises/${editingExercise.id}`
        : '/api/exercises';
      const method = editingExercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        resetForm();
        fetchExercises();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to save exercise');
      }
    } catch (error) {
      console.error('Failed to save exercise:', error);
      alert('An error occurred');
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      title: exercise.title,
      description: exercise.description,
      question: exercise.question,
      type: exercise.type,
      answer: exercise.answer || '',
      points: exercise.points,
    });

    if (exercise.type === 'MULTIPLE_CHOICE' && exercise.options.length > 0) {
      setOptions(
        exercise.options.map((opt) => ({
          text: opt.text,
          isCorrect: opt.isCorrect,
        }))
      );
    }

    setShowForm(true);
  };

  const handleDelete = async (exerciseId: string) => {
    if (!confirm('Are you sure you want to delete this exercise?')) {
      return;
    }

    try {
      const response = await fetch(`/api/exercises/${exerciseId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExercises();
      } else {
        alert('Failed to delete exercise');
      }
    } catch (error) {
      console.error('Failed to delete exercise:', error);
      alert('An error occurred');
    }
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading exercises...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercises & Quizzes</CardTitle>
              <CardDescription>Add practice exercises and quizzes for students</CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>Add Exercise</Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {exercises.length === 0 && !showForm ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No exercises yet</p>
              <Button onClick={() => setShowForm(true)}>Add Your First Exercise</Button>
            </div>
          ) : (
            <div className="space-y-2">
              {exercises.map((exercise, index) => (
                <div
                  key={exercise.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">#{index + 1}</span>
                      <h4 className="font-medium">{exercise.title}</h4>
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        {exercise.type.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        {exercise.points} pts
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {exercise.question}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(exercise)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(exercise.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Exercise Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingExercise ? 'Edit Exercise' : 'Add New Exercise'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., JavaScript Variables Quiz"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of the exercise..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Exercise Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as Exercise['type'] })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="MULTIPLE_CHOICE">Multiple Choice</option>
                  <option value="TEXT">Text Answer</option>
                  <option value="CODE">Code Exercise</option>
                  <option value="FILE_UPLOAD">File Upload</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Points</label>
                <Input
                  type="number"
                  value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 10 })}
                  min="1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Question</label>
              <textarea
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is the question or prompt?"
              />
            </div>

            {/* Multiple Choice Options */}
            {formData.type === 'MULTIPLE_CHOICE' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Answer Options</label>
                  <Button size="sm" variant="outline" onClick={handleAddOption}>
                    Add Option
                  </Button>
                </div>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        placeholder={`Option ${index + 1}`}
                      />
                      <div className="flex items-center gap-2 whitespace-nowrap">
                        <input
                          type="radio"
                          checked={option.isCorrect}
                          onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                          id={`correct-${index}`}
                        />
                        <label htmlFor={`correct-${index}`} className="text-sm">
                          Correct
                        </label>
                      </div>
                      {options.length > 2 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveOption(index)}
                        >
                          ✕
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Text/Code Answer */}
            {(formData.type === 'TEXT' || formData.type === 'CODE') && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Expected Answer (optional, for auto-grading)
                </label>
                <textarea
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the correct answer for auto-grading..."
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for manual grading
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSubmit}>
                {editingExercise ? 'Update Exercise' : 'Add Exercise'}
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
