"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

const accountSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const companySchema = z.object({
  companyName: z.string().min(2, "Company name is required."),
  industry: z.string().min(2, "Industry is required."),
})

const planSchema = z.object({
  users: z.number().min(1).max(100),
})

type AccountValues = z.infer<typeof accountSchema>
type CompanyValues = z.infer<typeof companySchema>
type PlanValues = z.infer<typeof planSchema>

const steps = [
  { id: 1, name: "Create Account", schema: accountSchema },
  { id: 2, name: "Company Info", schema: companySchema },
  { id: 3, name: "Select Plan", schema: planSchema },
]

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [userCount, setUserCount] = useState(5)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm({
    resolver: zodResolver(steps[currentStep].schema),
  })

  const nextStep = async (data: any) => {
    setFormData(prev => ({ ...prev, ...data }))
    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1)
      form.reset()
    } else {
      // Final submission
      console.log("Final form data:", { ...formData, ...data, users: userCount })
       toast({
        title: "Account Created!",
        description: "Welcome to Sebenza! Redirecting you to the dashboard.",
      })
      router.push("/dashboard")
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(step => step - 1)
    }
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Step {currentStep + 1} of {steps.length}: {steps[currentStep].name}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
          >
            <Form {...form}>
              <form onSubmit={form.handleSubmit(nextStep)} className="space-y-6">
                {currentStep === 0 && (
                  <>
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl><Input placeholder="m@example.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl><Input type="password" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </>
                )}

                {currentStep === 1 && (
                  <>
                    <FormField control={form.control} name="companyName" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Company Name</FormLabel>
                        <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="industry" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Industry</FormLabel>
                        <FormControl><Input placeholder="e.g., Construction, Real Estate" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </>
                )}

                {currentStep === 2 && (
                  <div className="space-y-4">
                    <Label>Number of Users</Label>
                    <p className="text-sm text-muted-foreground">
                      Select how many employees will need access. You are charged per user.
                    </p>
                    <div className="flex items-center justify-between gap-4">
                       <Slider
                        defaultValue={[userCount]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(value) => setUserCount(value[0])}
                      />
                       <div className="text-xl font-bold w-24 text-center p-2 rounded-md bg-primary/10">
                        {userCount}
                       </div>
                    </div>
                     <div className="text-center">
                        <p className="text-3xl font-bold">${userCount * 10}<span className="text-lg font-normal text-muted-foreground">/mo</span></p>
                        <p className="text-xs text-muted-foreground">Billed annually</p>
                    </div>
                  </div>
                )}
                 <div className="flex justify-between pt-4">
                  <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                    Back
                  </Button>
                  <Button type="submit">
                    {currentStep === steps.length - 1 ? "Finish" : "Next"}
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        </AnimatePresence>
      </CardContent>
       <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-center w-full">
            Already have an account?{" "}
          <Link href="/auth/login" className="underline">
            Login
          </Link>
        </div>
      </CardFooter>
    </Card>
  )
}
