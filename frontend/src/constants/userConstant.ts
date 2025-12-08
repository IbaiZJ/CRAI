export type User = {
  id: string
  name: string
  email: string
  role: "admin" | "user" | "guest"
  status: "active" | "inactive"
  createdAt: string
}

export const users: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    role: "guest",
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "Alice Johnson",
    email: "alice@example.com",
    role: "user",
    status: "active",
    createdAt: "2024-03-25",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "guest",
    status: "inactive",
    createdAt: "2024-04-02",
  },
]
