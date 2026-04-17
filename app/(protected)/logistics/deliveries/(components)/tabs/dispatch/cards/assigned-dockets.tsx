'use client'

export default function AssignedDockets({ date }: { date: Date }) {
  return (
    <div className="bg-white border border-gray-800 h-[100vh] p-2 rounded-lg">
      <span>ASSIGNED DOCKETS ${date.toLocaleDateString()}</span>
    </div>
  )
}