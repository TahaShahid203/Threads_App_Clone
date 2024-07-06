"use server"

import path from "path";
import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser(
    {userId,
    username,
    name,
    bio,
    image,
    path
} : Params
): Promise<void> {
    await connectToDB();

    try {
        await User.findOneAndUpdate({ id: userId },
            {
                username: username.toLowerCase(),
                name,
                bio,
                image,
            },
            {
                upsert: true
            }
        );
    
        if (path === '/profile/edit') {
            revalidatePath(path);
        }
    } catch (error) {
        throw new Error(`Error updating user: ${error}`);
    }
}