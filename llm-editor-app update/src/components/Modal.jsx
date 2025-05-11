import { useState } from "react";
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FaRegFlag } from 'react-icons/fa6'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useSubmitComplaint } from "../costumeQuerys/collaboratorQuery";

const Modal = ({ trigger, title, description, children, footer }) => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" className='border-none hover:bg-white shadow-none'>{trigger}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                {children}
                <DialogFooter>
                    {footer}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export const ComplaintModal = ({ collaborator }) => {
    const [subject, setSubject] = useState("");
    const [content, setContent] = useState("");
    const [evidence, setEvidence] = useState("");
    const [open, setOpen] = useState(false);
    
    const { submitComplaint, isPending } = useSubmitComplaint();
    
    const handleSubmit = () => {
        // 验证表单
        if (!subject) {
            return alert("Please select a subject");
        }
        if (!content.trim()) {
            return alert("Please describe your complaint");
        }
        if (!evidence.trim()) {
            return alert("Please provide evidence or reason for your complaint");
        }
        
        // 提交投诉
        submitComplaint({
            collaborator: collaborator,
            subject: subject,
            content: content,
            reason: evidence
        }, {
            onSuccess: () => {
                // 成功后重置表单并关闭模态框
                handleReset();
                setOpen(false);
            }
        });
    };
    
    const handleReset = () => {
        setSubject("");
        setContent("");
        setEvidence("");
    };
    
    const trigger = <FaRegFlag className="text-gray-400 hover:text-red-500 transition-colors" />;
    const title = "Report Collaborator";
    const description = "Submit your complaint about this collaborator to the administrator";
    
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="subject" className="text-right">
                            Subject
                        </Label>
                        <div className="col-span-3">
                            <Select value={subject} onValueChange={setSubject}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select complaint type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Unauthorized Content Deletion">Unauthorized Content Deletion</SelectItem>
                                    <SelectItem value="Inappropriate Content">Inappropriate Content</SelectItem>
                                    <SelectItem value="Plagiarism">Plagiarism</SelectItem>
                                    <SelectItem value="Project Sabotage">Project Sabotage</SelectItem>
                                    <SelectItem value="Unauthorized Access">Unauthorized Access</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="content" className="text-right mt-2">
                            Content
                        </Label>
                        <Textarea
                            id="content"
                            placeholder="Describe your complaint in detail"
                            className="col-span-3"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-start gap-4">
                        <Label htmlFor="evidence" className="text-right mt-2">
                            Evidence
                        </Label>
                        <Textarea
                            id="evidence"
                            placeholder="Provide evidence or reason for your complaint"
                            className="col-span-3"
                            rows={3}
                            value={evidence}
                            onChange={(e) => setEvidence(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="flex justify-between">
                    <Button type="button" variant="outline" onClick={handleReset}>
                        Reset
                    </Button>
                    <Button type="button" onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Submitting..." : "Submit Complaint"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
