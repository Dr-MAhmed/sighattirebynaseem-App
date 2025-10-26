"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { sendContactEmail } from "@/lib/email/contact-email";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(10, {
    message: "Message must be at least 10 characters.",
  }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const result = await sendContactEmail(values);

      if (result.success) {
        toast({
          title: "Message Sent",
          description:
            "Thank you for contacting us. We'll get back to you soon.",
        });
        form.reset();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container max-w-4xl px-4 py-12 md:px-6">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold md:text-4xl">Contact Us</h1>
        <p className="text-muted-foreground">
          We're here to help with any questions about our products or services.
        </p>
      </div>

      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="mb-6 text-xl font-semibold">Get in Touch</h2>
          <div className="space-y-6">
            <div>
              <h3 className="mb-2 text-base font-medium">Address</h3>
              <p className="text-muted-foreground">Lahore, Pakistan</p>
            </div>
            <div>
              <h3 className="mb-2 text-base font-medium">Phone</h3>
              <p className="text-muted-foreground">+92 3354034038</p>
            </div>
            <div>
              <h3 className="mb-2 text-base font-medium">Email</h3>
              <p className="text-muted-foreground">
                info@sighattirebynaseem.com
              </p>
            </div>
            <div>
              <h3 className="mb-2 text-base font-medium">Business Hours</h3>
              <p className="text-muted-foreground">
                Monday - Saturday: 9am - 9pm
              </p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-6 text-xl font-semibold">Send a Message</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Subject</FormLabel>
                    <FormControl>
                      <Input placeholder="Subject of your message" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please provide details about your inquiry"
                        className="min-h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
