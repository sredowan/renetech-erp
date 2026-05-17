const sequelize = require('./config/db.config');
const Course = require('./models/Course');
const Branch = require('./models/Branch');

async function seed() {
  try {
    await sequelize.authenticate();
    
    // Ensure we have a branch to associate with
    const [branch] = await Branch.findOrCreate({
      where: { id: 1 },
      defaults: { name: 'HQ Branch', code: 'HQ', location: 'Dhaka', status: 'active' }
    });

    const coursesToCreate = [
      {
        branch_id: branch.id,
        title: 'PTE Basic',
        slug: 'pte-basic',
        category: 'PTE',
        level: 'beginner',
        base_fee: 5500,
        duration_weeks: 2,
        short_description: '2 Weeks, 4 classes. (Unlimited Mock test Included).',
        description: 'Perfect for students who need a quick refresher. Covers the PTE format over 4 specialized classes, and includes access to our unlimited mock test platform.',
        what_you_will_learn: [
          'Understanding the PTE Exam Format',
          'Quick refresh of core modules: Speaking, Writing, Reading, Listening',
          'Time management strategies',
          'Unlimited Mock tests for confidence building'
        ],
        modules: [
          { title: 'Week 1: Foundations', lessons: [{ title: 'Class 1: Speaking & Writing', duration: '120' }, { title: 'Class 2: Reading & Listening', duration: '120' }] },
          { title: 'Week 2: Mock Tests & Reviews', lessons: [{ title: 'Class 3: Assessment', duration: '120' }, { title: 'Class 4: Final Tips', duration: '120' }] }
        ],
        is_published: true,
        status: 'active'
      },
      {
        branch_id: branch.id,
        title: 'PTE Core',
        slug: 'pte-core',
        category: 'PTE',
        level: 'intermediate',
        base_fee: 10500,
        duration_weeks: 4,
        short_description: '4 Weeks, 8 Classes. (Unlimited Mock test and class access).',
        description: 'Our most popular standard tier. Gain solid insights over 4 weeks with 8 focused classes, plus unlimited access to live classes and our mock examination platform.',
        what_you_will_learn: [
          'Detailed strategies for high-weightage questions',
          'Template utilization for essays and spoken responses',
          'Pronunciation and fluency improvement techniques',
          'Unlimited mock test access with AI scoring'
        ],
        modules: [
          { title: 'Week 1-2: Intensive Speaking & Writing', lessons: [{ title: 'Session 1-4', duration: '120' }] },
          { title: 'Week 3-4: Intensive Reading & Listening', lessons: [{ title: 'Session 5-8', duration: '120' }] }
        ],
        is_published: true,
        status: 'active'
      },
      {
        branch_id: branch.id,
        title: 'PTE Advanced',
        slug: 'pte-advanced',
        category: 'PTE',
        level: 'advanced',
        base_fee: 18000,
        duration_weeks: 8,
        short_description: '8 Weeks, 16 Classes. (Unlimited Mock test and class access).',
        description: 'For students aiming for a 79+ superior score. Spend 8 weeks practicing advanced grammar, complex reading passages, and native-level fluency with 16 dedicated classes.',
        what_you_will_learn: [
          'Advanced grammatical structures for maximum points',
          'Handling complex audio cues in listening',
          'Reading fill-in-the-blanks mastery',
          'Weekly one-on-one evaluations'
        ],
        modules: [
          { title: 'Month 1: Core Fundamentals & Intermediate Concepts', lessons: [{ title: '8 Classes on all 4 modules', duration: '120' }] },
          { title: 'Month 2: Advanced Perfection', lessons: [{ title: '8 Classes focusing on high-difficulty questions', duration: '120' }] }
        ],
        is_published: true,
        status: 'active'
      },
      {
        branch_id: branch.id,
        title: 'PTE Premium',
        slug: 'pte-premium',
        category: 'PTE',
        level: 'advanced',
        base_fee: 25000,
        duration_weeks: 12,
        short_description: '12 Weeks, 24 Classes. (Unlimited Mock test and class access).',
        description: 'Our flagship 3-month comprehensive package. Enjoy 24 extensive classes that build your English skills from the ground up to advanced PTE superiority.',
        what_you_will_learn: [
          'Absolute ground-up fundamentals for struggling speakers',
          'Comprehensive grammar and vocabulary building',
          'AI-driven error correction over 3 months',
          'Complete unlimited access to all platform tools'
        ],
        modules: [
          { title: 'Month 1: General English Enhancement', lessons: [{ title: '8 Classes', duration: '120' }] },
          { title: 'Month 2: PTE Core Strategy', lessons: [{ title: '8 Classes', duration: '120' }] },
          { title: 'Month 3: Advanced Scoring & Mock Trials', lessons: [{ title: '8 Classes', duration: '120' }] }
        ],
        is_published: true,
        status: 'active'
      }
    ];

    for (const data of coursesToCreate) {
      await Course.findOrCreate({
        where: { slug: data.slug },
        defaults: data
      });
      // updating in case it exists to reflect newest data
      await Course.update(data, { where: { slug: data.slug } });
    }

    console.log('Courses seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

seed();
