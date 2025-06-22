import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, CheckCircle, Circle } from 'lucide-react';

interface Todo {
    id: string;
    text: string;
    completed: boolean;
}

const ToDoPanel: React.FC = () => {
    const [todos, setTodos] = useState<Todo[]>([
        { id: '1', text: 'Review monthly transactions', completed: false },
        { id: '2', text: 'Update security settings', completed: true },
        { id: '3', text: 'Schedule bill payments', completed: false },
    ]);
    const [newTodo, setNewTodo] = useState('');

    const addTodo = () => {
        if (newTodo.trim()) {
            const todo: Todo = {
                id: Date.now().toString(),
                text: newTodo.trim(),
                completed: false,
            };
            setTodos([...todos, todo]);
            setNewTodo('');
        }
    };

    const toggleTodo = (id: string) => {
        setTodos(todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        ));
    };

    const deleteTodo = (id: string) => {
        setTodos(todos.filter(todo => todo.id !== id));
    };

    const completedCount = todos.filter(todo => todo.completed).length;
    const totalCount = todos.length;

    return (
        <Card className="card-modern">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-lg font-semibold text-[#F1F1F1]">To-Do List</CardTitle>
                <div className="text-sm text-gray-400">
                    {completedCount}/{totalCount} completed
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Add new todo */}
                <motion.div 
                    className="flex gap-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Input
                        value={newTodo}
                        onChange={(e) => setNewTodo(e.target.value)}
                        placeholder="Add a new task..."
                        onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                        className="flex-1 transition-all duration-200 hover:scale-[1.01] focus:scale-[1.02]"
                    />
                    <Button 
                        onClick={addTodo}
                        size="sm"
                        className="transition-all duration-200 hover:scale-105 hover:shadow-lg"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </motion.div>

                {/* Todo list */}
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    <AnimatePresence>
                        {todos.map((todo, index) => (
                            <motion.div
                                key={todo.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800/70 hover:shadow-md"
                            >
                                <motion.button
                                    onClick={() => toggleTodo(todo.id)}
                                    className="flex items-center justify-center w-5 h-5 transition-all duration-200 hover:scale-110"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {todo.completed ? (
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                        <Circle className="w-5 h-5 text-gray-400" />
                                    )}
                                </motion.button>
                                
                                <motion.span
                                    className={`flex-1 text-sm transition-all duration-200 ${
                                        todo.completed 
                                            ? 'text-gray-500 line-through' 
                                            : 'text-gray-300'
                                    }`}
                                    initial={{ opacity: 1 }}
                                    animate={{ 
                                        opacity: todo.completed ? 0.6 : 1,
                                        scale: todo.completed ? 0.98 : 1
                                    }}
                                >
                                    {todo.text}
                                </motion.span>
                                
                                <motion.button
                                    onClick={() => deleteTodo(todo.id)}
                                    className="text-gray-500 hover:text-red-500 transition-all duration-200 hover:scale-110"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </motion.button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Progress bar */}
                <motion.div 
                    className="w-full bg-gray-700 rounded-full h-2 overflow-hidden"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <motion.div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: totalCount > 0 ? completedCount / totalCount : 0 }}
                        transition={{ delay: 0.7, duration: 0.8, ease: "easeOut" }}
                    />
                </motion.div>
            </CardContent>
        </Card>
    );
};

export default ToDoPanel; 