import { z } from "zod"

export const MessageResSchema = z.object({
    massage: z.string()
})

export type MessageResType = z.infer<typeof MessageResSchema>
