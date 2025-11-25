# Anonymous Feedback App

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black)
![React](https://img.shields.io/badge/React-19.0-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC)

## 🚀 Introduction

**Anonymous** is a cutting-edge feedback and messaging application designed to facilitate open and honest communication. Built with the latest web technologies, it allows users to receive anonymous messages, leverage AI for smart suggestions, and manage their feedback through a sleek dashboard.

Whether you're looking to gather genuine feedback from friends, colleagues, or your audience, Anonymous provides a secure and user-friendly platform to do so.

## ✨ Key Features

- **🔒 Anonymous Messaging**: Receive messages without revealing the sender's identity.
- **🤖 AI-Powered Suggestions**: Integrated with OpenAI to suggest message replies and content.
- **🛡️ Secure Authentication**: Robust user authentication using NextAuth.js.
- **📊 User Dashboard**: A comprehensive dashboard to manage and view received messages.
- **🎨 Modern UI/UX**: Built with Shadcn UI and Tailwind CSS for a beautiful, responsive design.
- **📧 Email Notifications**: Integration with Resend for reliable email delivery.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **AI Integration**: [Vercel AI SDK](https://sdk.vercel.ai/docs) (OpenAI)
- **Email**: [Resend](https://resend.com/)

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/anonymous.git
    cd anonymous
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up Environment Variables:**

    Create a `.env` file in the root directory and add the following variables:

    ```env
    MONGODB_URI=your_mongodb_connection_string
    NEXTAUTH_SECRET=your_nextauth_secret
    OPENAI_API_KEY=your_openai_api_key
    RESEND_API_KEY=your_resend_api_key
    # Add other necessary variables
    ```

4.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 📂 Project Structure

```
├── src
│   ├── app             # Next.js App Router pages and layouts
│   ├── components      # Reusable UI components
│   ├── lib             # Utility functions and configurations
│   ├── models          # Mongoose database models
│   ├── schemas         # Zod validation schemas
│   ├── types           # TypeScript type definitions
│   └── ...
├── public              # Static assets
├── emails              # React Email templates
└── ...
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
