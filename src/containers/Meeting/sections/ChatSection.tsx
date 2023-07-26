'use client'

import { MeetingParticipant, useCurrentParticipant, useMeetingMessages, useMeetingParticipantsList } from '../contexts'
import { Avatar, Form, Input } from 'antd'
import { map } from 'lodash'
import { SendIcon } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import Scrollbars from 'react-custom-scrollbars-2'
import { Room } from '@prisma/client'
import { createMessage } from '@/app/actions/chat'
import { ButtonIcon } from '@/components'
import { formatDateChat } from '@/utils'

type Props = {
  room: Partial<Room> | null
}

export const ChatSection: React.FC<Props> = ({ room }) => {
  const ref = useRef<Scrollbars>(null)
  const refInput = useRef<any>(null)
  const [form] = Form.useForm()

  const messages = useMeetingMessages()
  const paticipantsList = useMeetingParticipantsList()
  const currentParticipant = useCurrentParticipant()

  useEffect(() => {
    ref.current?.scrollToBottom()
  }, [messages])

  const onSend = useCallback(
    (values: { input: string }) => {
      if (!values?.input) return
      createMessage({
        data: {
          content: values?.input,
          roomId: room!.id!,
          participantId: currentParticipant.id,
        },
      }).then(() => {
        form.setFieldValue('input', '')
        refInput.current?.focus()
      })
    },
    [currentParticipant.id, form, room]
  )

  // TODO: add type
  const renderUserStatus = useCallback((participant: MeetingParticipant) => {
    if (participant.meetingStatus?.online) {
      if (participant.meetingStatus?.joining === 'prepare-meeting') {
        return <div className="ml-2 w-1 h-1 rounded-full bg-[#FBBF24]" />
      }
      if (participant.meetingStatus?.joining === 'meeting') {
        return <div className="ml-2 w-1 h-1 rounded-full bg-[#10B981]" />
      }
    } else {
      return <div className="ml-2 w-1 h-1 rounded-full bg-[#F87171]" />
    }
  }, [])

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center border-b dark:border-b-[#232C3C] h-16 px-4 dark:bg-[#1D2431] bg-white">
        <div className="text-lg text-[#9CA3AF]">Participants ({paticipantsList?.length})</div>
      </div>
      <div className="border-b dark:border-b-[#232C3C] max-h-[300px] min-h-[50px]">
        <Scrollbars className="h-full">
          <div className="p-2 h-full">
            {/* List participating user by name and image and active status*/}
            {map(paticipantsList, (p) => (
              <div className="flex items-center mb-2 last:mb-0" key={p.id}>
                <Avatar src={p.user?.image}>{p.name?.charAt(0)}</Avatar>
                <div className="ml-2 text-[#9CA3AF]">{p.name}</div>
                {renderUserStatus(p)}
              </div>
            ))}
          </div>
        </Scrollbars>
      </div>
      <div className="flex-1 flex flex-col">
        <div className="flex items-center border-b dark:border-b-[#232C3C] h-16 px-4 dark:bg-[#1D2431] bg-white">
          <div className="text-lg text-[#9CA3AF]">Chat</div>
        </div>
        <Scrollbars ref={ref}>
          <div className="p-2">
            {map(messages, (message) => (
              <div key={message.id} className="mb-2">
                <div className="flex items-center">
                  <Avatar className="mr-2" src={message.participant.user?.image}>
                    {message.participant.name?.charAt(0)}
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <div className="text-xs font-bold text-[#F87171]">{message.participant.name}</div>
                      <div className="ml-2 text-xs text-[#9CA3AF]">{formatDateChat(message.createdAt)}</div>
                    </div>
                    <div className="text-sm text-[#9CA3AF]">{message.content}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Scrollbars>
      </div>
      <Form form={form} onFinish={onSend}>
        <div className="flex items-center justify-center h-16 border-t dark:border-t-[#232C3C]">
          <div className="flex items-center justify-between w-full px-4">
            <Form.Item className="mb-0 flex-1 mr-2" name="input">
              <Input
                ref={refInput}
                size="large"
                className="bg-transparent border-transparent flex-1 text-[#6B7280] placeholder:text-[#6B7280]"
                placeholder="Type something..."
              />
            </Form.Item>
            <ButtonIcon htmlType="submit" size="large" type="primary" icon={<SendIcon size={16} />} />
          </div>
        </div>
      </Form>
    </div>
  )
}