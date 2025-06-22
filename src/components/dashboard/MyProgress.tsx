import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const MyProgress = ({ stats }) => (
    <div className="space-y-6">
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="bg-gray-800/80 border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-gray-800/90">
                <CardHeader>
                    <CardTitle className="text-white">Spending Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                    >
                        <ResponsiveContainer width="100%" height={150}>
                            <BarChart data={stats.recentTransactions}>
                                <XAxis dataKey="type" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Bar dataKey="amount" fill="#7c3aed" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
        >
            <Card className="bg-custom-purple text-white border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:bg-purple-700">
                <CardHeader>
                    <CardTitle>Transactions Completed</CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.p 
                        className="text-5xl font-bold"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3, duration: 0.5 }}
                    >
                        {stats.totalTransactions}
                    </motion.p>
                    <motion.p 
                        className="text-purple-200"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        in the last 30 days
                    </motion.p>
                </CardContent>
            </Card>
        </motion.div>

        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
        >
            <Card className="bg-gray-800/80 border-gray-700 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:bg-gray-800/90">
                <CardHeader>
                    <CardTitle className="text-white">Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                    >
                        <ResponsiveContainer width="100%" height={100}>
                            <LineChart data={stats.recentTransactions}>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Line type="monotone" dataKey="amount" stroke="#7c3aed" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>
                </CardContent>
            </Card>
        </motion.div>
    </div>
);

export default MyProgress; 