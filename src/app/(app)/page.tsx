"use client";

import { Mail, Lock, Zap, MessageSquare, UserPlus, Send, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import messages from "@/messages.json";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function Home() {
  return (
    <>
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-900 text-white">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 px-4 text-center bg-gradient-to-b from-gray-900 to-gray-800">
          <div className="container mx-auto max-w-4xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
              Dive into the World of Anonymous Feedback
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              True Anonymity - Where your identity remains a secret.
            </p>
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all hover:scale-105">
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 px-4 bg-gray-800">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Why Choose Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="bg-gray-700 border-gray-600 text-white">
                <CardHeader>
                  <Lock className="w-12 h-12 text-blue-400 mb-4" />
                  <CardTitle className="text-xl">Total Anonymity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Your identity is completely hidden. Receive honest feedback without any bias.</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700 border-gray-600 text-white">
                <CardHeader>
                  <Zap className="w-12 h-12 text-yellow-400 mb-4" />
                  <CardTitle className="text-xl">Instant Setup</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">Create your account in seconds and start receiving messages immediately.</p>
                </CardContent>
              </Card>
              <Card className="bg-gray-700 border-gray-600 text-white">
                <CardHeader>
                  <Shield className="w-12 h-12 text-green-400 mb-4" />
                  <CardTitle className="text-xl">Safe & Secure</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300">We prioritize your privacy and security. Your data is safe with us.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 px-4 bg-gray-900">
          <div className="container mx-auto max-w-6xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">1. Create Account</h3>
                <p className="text-gray-400">Sign up for free and get your unique profile link.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mb-4">
                  <Send className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">2. Share Link</h3>
                <p className="text-gray-400">Share your link on social media or with friends.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">3. Receive Messages</h3>
                <p className="text-gray-400">Read anonymous messages on your personal dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Carousel Section */}
        <section className="w-full py-16 px-4 bg-gray-800">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-8">See What Others Are Saying</h2>
            <Carousel
              plugins={[Autoplay({ delay: 2000 })]}
              className="w-full max-w-lg md:max-w-xl mx-auto"
            >
              <CarouselContent>
                {messages.map((message, index) => (
                  <CarouselItem key={index} className="p-4">
                    <Card className="bg-gray-700 border-gray-600">
                      <CardHeader>
                        <CardTitle className="text-white">{message.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                        <Mail className="flex-shrink-0 text-blue-400" />
                        <div className="text-left">
                          <p className="text-gray-200">{message.content}</p>
                          <p className="text-xs text-gray-400 mt-2">
                            {message.received}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-16 px-4 bg-gray-900">
          <div className="container mx-auto max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1" className="border-gray-700">
                <AccordionTrigger className="text-lg hover:text-blue-400">Is it really anonymous?</AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes! We do not track or reveal the identity of the sender. Your privacy is our top priority.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2" className="border-gray-700">
                <AccordionTrigger className="text-lg hover:text-blue-400">Is it free to use?</AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Absolutely. Creating an account and receiving messages is completely free.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3" className="border-gray-700">
                <AccordionTrigger className="text-lg hover:text-blue-400">Can I report abusive messages?</AccordionTrigger>
                <AccordionContent className="text-gray-400">
                  Yes, you can delete any message you don&apos;t like. We are also working on reporting features to keep the platform safe.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-center p-6 bg-gray-950 text-gray-400">
        © 2024 Anaynomous. All rights reserved.
      </footer>
    </>
  );
}
