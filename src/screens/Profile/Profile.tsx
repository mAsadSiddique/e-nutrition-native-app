import { Stack } from 'expo-router'
import React from 'react'

export const Profile = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: true,
                headerTitle: '',
                // headerBackTitleVisible: false,
                headerStyle: { backgroundColor: '#fff' },
                headerTintColor: '#222',
            }}
        >
            <Stack.Screen
                name="edit"
                options={{
                    headerTitle: '',
                }}
            />
            <Stack.Screen
                name="change-password"
                options={{
                    headerTitle: '',
                }}
            />
            <Stack.Screen
                name="privacy"
                options={{
                    headerTitle: '',
                }}
            />
        </Stack>
    )
}
