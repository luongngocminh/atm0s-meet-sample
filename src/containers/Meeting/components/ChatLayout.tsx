'use client'

import { Input, InputRef } from 'antd'
import { SendIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useCallback, useState, useTransition } from 'react'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon } from '@/components'
import { useMeetingMessages, useMeetingUsersList } from '@/contexts'

const Chat = dynamic(() => import('@/components/Chat'), { ssr: false })

type Props = {
  room: Partial<Room> | null
}

export const ChatLayout: React.FC<Props> = ({ room }) => {
  const [isSending, startSending] = useTransition()
  const [input, setInput] = useState('')

  const messages = useMeetingMessages()
  const users = useMeetingUsersList()

  const onSend = useCallback(() => {
    startSending(() => {
      if (!input) {
        return
      }
      createMessage({
        data: {
          content: input,
          roomId: room!.id!,
        },
      }).then(() => {
        setInput('')
      })
    })
  }, [input, room])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 bg-[#1B2432]">
        <div className="text-lg text-[#9CA3AF]">Participants ({users.length})</div>
        {/* List participating user by name and image and active status*/}
        {users.map((user: any) => (
          <div className="flex items-center mt-2" key={user.id}>
            <img src={user.image} alt="" className="w-8 h-8 rounded-full" />
            <div className="ml-2 text-[#9CA3AF]">{user.name}</div>
            {user.active ? (
              <div className="ml-2 w-2 h-2 rounded-full bg-[#10B981]" />
            ) : (
              <div className="ml-2 w-2 h-2 rounded-full bg-[#F87171]" />
            )}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="px-4 py-3 bg-[#1B2432]">
          <div className="text-lg text-[#9CA3AF]">Chat (3)</div>
        </div>
        <Chat messages={messages} />
      </div>
      <div className="flex items-center justify-center h-16 border-t border-t-[#232C3C]">
        <div className="flex items-center justify-between w-full px-4">
          <Input
            size="large"
            className="bg-transparent border-transparent flex-1 mr-2 text-[#6B7280] placeholder:text-[#6B7280]"
            placeholder="Type something..."
            onPressEnter={onSend}
            onChange={(e) => setInput(e.target.value)}
            value={input}
          />
          <ButtonIcon size="large" type="primary" onClick={onSend} icon={<SendIcon size={16} />} />
        </div>
      </div>
    </div>
  )
}
