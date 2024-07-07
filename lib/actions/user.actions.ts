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
    onboarded: boolean;
}

export async function updateUser(
    {userId,
    username,
    name,
    bio,
    image,
    onboarded,
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
                onboarded,
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

export async function fetchUser(userId: string) {
    try {
        await connectToDB();

        return await User.findOne({ id: userId })
        // .populate({
        //     path: 'communities',
        //     model: Community
        // })
    } catch (error) {
        throw new Error(`Error fetching user: ${error}`);
    }
}