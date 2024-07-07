"use server"

import { connectToDB } from "../mongoose"
import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder } from "mongoose";

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

export async function fetchUsers ({ 
    userId,
    searchString="",
    pageNumber=1,
    pageSize=20,
    sortBy = 'desc'
 }: {
    userId: string;
    searchString?: string;
    pageNumber?: number;
    pageSize?: number;
    sortBy?: SortOrder;
 }){
    try {
        connectToDB();

        const skipAmount = (pageNumber-1)*pageSize;

        const regex = new RegExp(searchString, 'i');      
        
        const query: FilterQuery<typeof User> = {
            id: { $ne: userId },
        }

        if (searchString.trim() !== '')
        {
            query.$or = [
                { username: {$regex: regex} },
                { name: {$regex: regex} }
            ]
        }

        const sortOptions = { createdAt: sortBy };

        const usersQuery = User.find(query)
        .sort(sortOptions)
        .skip(skipAmount)
        .limit(pageSize);

        const totalUsersCount = await User.countDocuments(query);

        const users = await usersQuery.exec();

        const isNext = totalUsersCount > skipAmount + users.length;

        return {
            users,
            isNext
        }
    } catch (error) {
        throw new Error(`Error fetching users: ${error}`);
    }
}