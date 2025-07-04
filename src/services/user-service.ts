import axios from 'axios'; 
import { apiClient } from '../config/api-client';
import { FinalUserData, RawUserData } from '../interfaces/user-interface';

function getImageValue(id: string): number {
    let sum = 0;
    for (const char of id) {
      sum += char.charCodeAt(0);
    }
    return sum % 10;
}

export const getUserDataFromSource = async (
    token: string,
    game_id: string
): Promise<FinalUserData | false> => { 
    try {
        const response = await apiClient.get('/service/user/detail', {
            headers: { token }
        });

        const userData: RawUserData | undefined = response?.data?.user;

        if (!userData) {
            console.error('User data not found in API response');
            return false;
        }

        const userId = encodeURIComponent(userData.user_id);
        const { operatorId } = userData; 
        const id = `${operatorId}:${userId}`;
        const image = getImageValue(id);

        const finalData: FinalUserData = {
            ...userData,
            userId,
            id,
            game_id,
            token,
            image,
        };

        return finalData;

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('getUserDataFromSource Axios Error:', error.response?.data || error.message);
        } 
        else if (error instanceof Error) {
            console.error('getUserDataFromSource Generic Error:', error.message);
        } 
        else {
            console.error('getUserDataFromSource Unknown Error:', error);
        }
        
        return false;
    }
};