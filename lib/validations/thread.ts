import * as z from "zod";

export const threadValidation = z.object({
    thread: z.string().min(3, "Minimum of 3 characters required"),
    accountId: z.string().min(1, "Account ID is required"),
});

export const CommentValidation = z.object({
    thread: z.string().min(3, "Minimum of 3 characters required"),

})