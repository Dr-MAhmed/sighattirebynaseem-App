"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/firebase/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { addCustomRequest } from "@/lib/firebase/firestore";
import { uploadImage } from "@/lib/cloudinary/cloudinary-utils";
import { Loader2 } from "lucide-react";
import { Toaster } from "sonner";
import { sendCustomRequestEmail } from "@/lib/email/send-custom-request-email";

export default function CustomRequestPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [details, setDetails] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      // Check file sizes before setting state
      for (let i = 0; i < selectedFiles.length; i++) {
        if (selectedFiles[i].size > 5 * 1024 * 1024) {
          toast.error("File too large", {
            description: `${selectedFiles[i].name} is too large. Maximum size is 5MB.`,
          });
          e.target.value = ""; // Clear the input
          return;
        }
      }
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Upload files to Cloudinary if any
      const uploadedUrls: string[] = [];
      if (files && files.length > 0) {
        toast.info("Uploading images...", {
          description: "Please wait while we upload your images.",
        });

        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          try {
            const url = await uploadImage(file, "custom-requests");
            uploadedUrls.push(url);
            toast.success(`Image ${i + 1} uploaded successfully`);
          } catch (error) {
            console.error(`Error uploading file ${file.name}:`, error);
            toast.error("Upload failed", {
              description: `Failed to upload ${file.name}. Please try again.`,
            });
            setIsLoading(false);
            return;
          }
        }
      }

      toast.info("Saving your request...", {
        description: "Please wait while we process your request.",
      });

      // Add custom request to Firestore
      await addCustomRequest({
        user_id: user?.uid || "anonymous",
        contact_email: email,
        contact_phone: phone,
        request_details: details,
        attached_files: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      toast.info("Sending email notification...", {
        description: "Please wait while we send the notification.",
      });

      // Send email notification using server action
      await sendCustomRequestEmail({
        userEmail: email,
        userPhone: phone,
        requestDetails: details,
        fileUrls: uploadedUrls.length > 0 ? uploadedUrls : undefined,
      });

      toast.success("Request submitted successfully!", {
        description:
          "We'll get back to you soon regarding your custom design request.",
      });

      // Reset form
      setEmail("");
      setPhone("");
      setDetails("");
      setFiles(null);

      // Redirect to home page after a short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error("Submission failed", {
        description:
          error.message ||
          "There was an error submitting your request. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container px-4 py-12 mx-auto md:px-6">
      <Toaster position="top-right" richColors />
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold md:text-4xl">
            Custom Design Request
          </h1>
          <p className="mt-2 text-muted-foreground">
            Tell us about your dream abaya and we'll bring it to life
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Request Form</CardTitle>
            <CardDescription>
              Please provide as much detail as possible about your custom design
              requirements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+92 XXX XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="details">Design Details</Label>
                <Textarea
                  id="details"
                  placeholder="Please describe your design requirements in detail. Include information about style, fabric, color, embellishments, and any specific measurements."
                  rows={6}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="files">Reference Images (Optional)</Label>
                <Input
                  id="files"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <p className="text-xs text-muted-foreground">
                  You can upload images for reference. Accepted formats: JPG,
                  PNG, JPEG. Max 5MB per file.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="p-4 text-sm rounded-lg bg-muted">
              <h3 className="mb-2 font-medium">What happens next?</h3>
              <ol className="space-y-1 list-decimal list-inside">
                <li>
                  Our design team will review your request within 24-48 hours.
                </li>
                <li>
                  We'll contact you to discuss details and provide a price
                  quote.
                </li>
                <li>Once approved, we'll begin creating your custom abaya.</li>
                <li>
                  Production typically takes 1-2 weeks depending on complexity.
                </li>
              </ol>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
