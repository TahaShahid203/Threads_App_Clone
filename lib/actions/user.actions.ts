"use server"

import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";

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

export async function fetchUserPosts(userId: string) {
    try {
        connectToDB();

        // TODO: Populate communities

        const threads = await User.findOne({id: userId})
        .populate({
            path: 'threads',
            model: Thread,
            populate: {
                path: 'children',
                model: Thread,
                populate: {
                    path: 'author',
                    model: User,
                    select: 'name image id'
                }
            }
        })

        return threads;
    } catch (error) {
        throw new Error(`Error fetching user posts: ${error}`);
    }
}