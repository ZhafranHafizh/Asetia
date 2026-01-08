
import { login, signup } from './actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-2 border-neo shadow-neo rounded-sm">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-black uppercase tracking-tighter">Asetia</CardTitle>
                    <CardDescription className="font-medium text-black">
                        Enter your credentials to access the marketplace.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 bg-muted border-2 border-black mb-6 p-0 h-auto rounded-none">
                            <TabsTrigger
                                value="login"
                                className="data-[state=active]:bg-primary data-[state=active]:text-black border-r-2 border-black rounded-none h-10 font-bold transition-all data-[state=active]:translate-x-[2px] data-[state=active]:translate-y-[2px] data-[state=active]:shadow-none"
                            >
                                Login
                            </TabsTrigger>
                            <TabsTrigger
                                value="signup"
                                className="data-[state=active]:bg-primary data-[state=active]:text-black rounded-none h-10 font-bold transition-all data-[state=active]:translate-x-[-2px] data-[state=active]:translate-y-[2px] data-[state=active]:shadow-none"
                            >
                                Sign Up
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form action={login} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="font-bold uppercase text-xs">Email</Label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus-visible:shadow-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="font-bold uppercase text-xs">Password</Label>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        required
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus-visible:shadow-none transition-all"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-primary text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none rounded-none transition-all mt-4"
                                >
                                    LOGIN
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="signup">
                            <form action={signup} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="full_name" className="font-bold uppercase text-xs">Full Name</Label>
                                    <Input
                                        id="full_name"
                                        name="full_name"
                                        placeholder="John Doe"
                                        required
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus-visible:shadow-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sign-email" className="font-bold uppercase text-xs">Email</Label>
                                    <Input
                                        id="sign-email"
                                        name="email"
                                        type="email"
                                        placeholder="m@example.com"
                                        required
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus-visible:shadow-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="sign-password" className="font-bold uppercase text-xs">Password</Label>
                                    <Input
                                        id="sign-password"
                                        name="password"
                                        type="password"
                                        required
                                        className="border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-black focus-visible:shadow-none transition-all"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    className="w-full bg-accent text-black font-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none rounded-none transition-all mt-4"
                                >
                                    SIGN UP
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
