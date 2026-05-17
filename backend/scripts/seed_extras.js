const sequelize = require('../config/db.config');
const User = require('../models/User');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Room = require('../models/Room');
const RoomBooking = require('../models/RoomBooking');
const Notification = require('../models/Notification');

const seedExtras = async () => {
    try {
        const studentUser = await User.findOne({ where: { email: 'rahat@student.com' } });
        const student = await Student.findOne({ where: { user_id: studentUser.id } });
        const batch = await Batch.findByPk(student.batch_id);
        const room = await Room.findOne({ where: { name: 'Room 101' } });

        if (!studentUser || !student || !batch || !room) {
            console.error('Core data missing. Run seed.js first.');
            process.exit(1);
        }

        console.log(`Found student: ${studentUser.name}, Batch: ${batch.name}`);

        // 1. Create Room Bookings (Schedule)
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextDay = new Date(today);
        nextDay.setDate(nextDay.getDate() + 2);

        await RoomBooking.bulkCreate([
            {
                branch_id: studentUser.branch_id,
                room_id: room.id,
                batch_id: batch.id,
                date: tomorrow.toISOString().split('T')[0],
                start_time: '10:00:00',
                end_time: '12:00:00'
            },
            {
                branch_id: studentUser.branch_id,
                room_id: room.id,
                batch_id: batch.id,
                date: nextDay.toISOString().split('T')[0],
                start_time: '14:00:00',
                end_time: '16:00:00'
            }
        ]);

        // 2. Create Notifications
        await Notification.bulkCreate([
            {
                user_id: studentUser.id,
                branch_id: studentUser.branch_id,
                title: 'Welcome to the Portal!',
                message: 'Hi Rahat, welcome to your new student portal. You can now check your schedule and attendance here.',
                type: 'info'
            },
            {
                user_id: studentUser.id,
                branch_id: studentUser.branch_id,
                title: 'Fees Reminder',
                message: 'Your monthly tuition fee for March is due. Please visit the accounts office.',
                type: 'alert'
            },
            {
                user_id: studentUser.id,
                branch_id: studentUser.branch_id,
                title: 'PTE Practice Update',
                message: 'New practice tasks have been added to the PTE lounge. Give them a try!',
                type: 'success'
            }
        ]);

        console.log('Extra seed data (Schedule & Notifications) added successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding extras:', error);
        process.exit(1);
    }
};

seedExtras();
