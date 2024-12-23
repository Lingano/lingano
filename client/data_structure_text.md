readings: [
    {
        id: (created by mongodb)
        owner_id: (created by mongodb)
        selected_words: array of numbers (indexes of the words)
        text: string
        formatted_text: array of arrays (sentences and words)
        public_access: boolean
    }
]
users: [
    {
        id: (created by mongodb)
        name: string
        email: string
        password: hashed/salted string
        subscription_tier: string
        readings: array of numbers (ids of readings)
    }
]