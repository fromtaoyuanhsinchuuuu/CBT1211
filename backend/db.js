const patients = [
    { id: 1, name: '张三', lastActivity: '5分钟前', avatar: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e88b3d0e-5f6f-4c93-add3-16e90217431b?apiKey=661e5fe4256247db9f0153c367d54989&' },
    { id: 2, name: '李四', lastActivity: '3小时前', avatar: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e88b3d0e-5f6f-4c93-add3-16e90217431b?apiKey=661e5fe4256247db9f0153c367d54989&' },
    { id: 3, name: '王五', lastActivity: '1天前', avatar: 'https://cdn.builder.io/api/v1/image/assets/TEMP/e88b3d0e-5f6f-4c93-add3-16e90217431b?apiKey=661e5fe4256247db9f0153c367d54989&' },
];

const sessions = [
    { id: 1, patientId: 1, date: '2023-10-26', duration: 50, notes: 'CBT会话，讨论自动化思维。', starred: true },
    { id: 2, patientId: 1, date: '2023-10-19', duration: 45, notes: '初步评估，建立治疗关系。', starred: false },
    { id: 3, patientId: 2, date: '2023-10-25', duration: 55, notes: '暴露疗法，处理焦虑情绪。', starred: true },
];

const homeworks = [
    {
        id: 1, 
        patientId: 1, 
        sessionId: 1, 
        title: '思维日记', 
        status: '待提交', 
        dueDate: '2023-11-02',
        description: '记录一周内出现的自动化思维，并尝试识别它们背后的核心信念。',
        submission: null,
        feedback: null
    },
    {
        id: 2, 
        patientId: 1, 
        sessionId: 2, 
        title: '活动安排', 
        status: '已完成', 
        dueDate: '2023-10-26',
        description: '计划并执行一项你因为焦虑而回避的活动。',
        submission: {
            content: '我去了超市，虽然一开始有点紧张，但后来感觉好多了。',
            submittedAt: '2023-10-25T18:30:00Z',
        },
        feedback: {
            content: '做得很好！这是一个重要的进步。',
            givenAt: '2023-10-26T10:00:00Z',
        }
    },
    {
        id: 3, 
        patientId: 2, 
        sessionId: 3, 
        title: '放松练习', 
        status: '待批阅', 
        dueDate: '2023-11-01',
        description: '每天进行15分钟的渐进式肌肉放松练习。',
        submission: {
            content: '我坚持每天练习，感觉对我的睡眠有帮助。',
            submittedAt: '2023-10-31T21:00:00Z',
        },
        feedback: null
    },
];

module.exports = { patients, sessions, homeworks };
