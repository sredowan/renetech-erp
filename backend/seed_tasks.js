const sequelize = require('./config/db.config');
const PteTask = require('./models/PteTask');

const tasks = [
    {
        section: 'speaking',
        type: 'Read Aloud',
        content: { prompt: 'The study of humanities and social sciences provides students with the critical thinking skills necessary to navigate the complexities of the modern world.' },
        correct_answer: 'humanities, critical thinking, navigate, modern world',
        max_score: 90
    },
    {
        section: 'writing',
        type: 'Summarize Written Text',
        content: { prompt: 'Climate change is the defining crisis of our time and it is happening even more quickly than we feared. No corner of the globe is immune from the devastating consequences of rising temperatures.' },
        correct_answer: 'climate change, crisis, devastating, globe, immune',
        max_score: 90
    },
    {
        section: 'reading',
        type: 'Fill in the Blanks',
        content: { prompt: 'The rapid ___ of technology has transformed the way we communicate. (evolution, decline, stability)' },
        correct_answer: 'evolution',
        max_score: 90
    },
    {
        section: 'listening',
        type: 'Write From Dictation',
        content: { prompt: 'Audio placeholder: Education is the most powerful weapon which you can use to change the world.' },
        correct_answer: 'education, powerful, weapon, change, world',
        max_score: 90
    }
];

async function seedTasks() {
  try {
    for (const task of tasks) {
        const [obj, created] = await PteTask.findOrCreate({
            where: { type: task.type, section: task.section },
            defaults: task
        });
        if (created) console.log(`Created ${task.type}`);
        else console.log(`Task ${task.type} already exists`);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding tasks:', err);
    process.exit(1);
  }
}

seedTasks();
