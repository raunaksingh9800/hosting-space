// components/selector.tsx
"use client"
import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface SelectCompProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function SelectComp({ value, onValueChange, disabled }: SelectCompProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select an AI provider" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>AI Providers</SelectLabel>
          <SelectItem value="gemini">Gemini</SelectItem>
          <SelectItem value="openai">OpenAI</SelectItem>
          <SelectItem value="claude">Claude</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}