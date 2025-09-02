import { Tabs } from "radix-ui";

export function TabsRoot({ defaultValue, children, ...props }) {
  return (
    <Tabs.Root defaultValue={defaultValue} {...props}>
      {children}
    </Tabs.Root>
  );
}

export function TabsList({ children, ...props }) {
  return (
    <Tabs.List className="flex flex-row gap-1" {...props}>
      {children}
    </Tabs.List>
  );
}

export function TabsTrigger({ value, children, ...props }) {
  return (
    <Tabs.Trigger
      className="py-1 px-3 bg-slate-700! border-1 border-slate-600 cursor-pointer data-[state=active]:bg-slate-200! data-[state=active]:text-neutral-950 data-[state=active]:font-bold data-[state=active]:border-b-0 text-white"
      value={value}
      {...props}
    >
      {children}
    </Tabs.Trigger>
  );
}

export function TabsContent({ value, children, ...props }) {
  return (
    <Tabs.Content
      className="bg-slate-200 border-1 border-slate-600 mt-[-1px] p-4"
      value={value}
      {...props}
    >
      {children}
    </Tabs.Content>
  );
}

// Example usage:
// <TabsRoot defaultValue="actions">
//   <TabsList aria-label="Actions">
//     <TabsTrigger value="actions">Actions</TabsTrigger>
//     <TabsTrigger value="craft">Craft</TabsTrigger>
//   </TabsList>
//   <TabsContent value="actions">
//     <p className="Text">Make changes to your account here. Click save when you're done.</p>
//   </TabsContent>
//   <TabsContent value="craft">
//     <p className="Text">Change your password here. After saving, you'll be logged out.</p>
//   </TabsContent>
// </TabsRoot>
