import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  completed: { type: Boolean, default: false }
});

const habitSchema = new mongoose.Schema({
  title: { type: String, required: true },
  goal: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  progress: [progressSchema],
  longestStreak: { type: Number, default: 0 }
});

const Habit = mongoose.model('Habit', habitSchema);

export default Habit;
