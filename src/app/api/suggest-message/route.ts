import { NextResponse } from "next/server";

const questionsList = [
  "What's a hobby you've always wanted to try?",
  "If you could have dinner with any historical figure, who would it be?",
  "What's a simple thing that makes you happy?",
  "What is your favorite travel destination?",
  "If you could have any superpower, what would it be?",
  "What is the best book you have ever read?",
  "What is your favorite movie of all time?",
  "If you could live anywhere in the world, where would it be?",
  "What is your favorite food?",
  "What is your biggest fear?",
  "What is your proudest accomplishment?",
  "If you could change one thing about the world, what would it be?",
  "What is your favorite childhood memory?",
  "What is your favorite song?",
  "If you could meet anyone, living or dead, who would it be?",
  "What is your favorite season?",
  "What is your favorite animal?",
  "What is your favorite color?",
  "What is your favorite sport?",
  "What is your favorite holiday?",
  "What is your favorite TV show?",
  "What is your favorite video game?",
  "What is your favorite board game?",
  "What is your favorite card game?",
  "What is your favorite app?",
  "What is your favorite website?",
  "What is your favorite podcast?",
  "What is your favorite YouTube channel?",
  "What is your favorite social media platform?",
  "What is your favorite emoji?",
];

export async function POST() {
  try {
    // Randomly select 3 questions
    const shuffled = questionsList.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, 3);
    const questionsString = selectedQuestions.join("||");

    return NextResponse.json(
      {
        success: true,
        message: "Messages suggested successfully",
        questions: questionsString,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error generating questions:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error generating questions",
      },
      { status: 500 }
    );
  }
}
