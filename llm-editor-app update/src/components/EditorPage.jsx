import Collaborators from "./Collaborators";

<div className="editor-sidebar">
  <Tabs defaultValue="collaborators" className="w-full">
    <TabsList className="grid w-full grid-cols-2">
      <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
      <TabsTrigger value="settings">Settings</TabsTrigger>
    </TabsList>
    <TabsContent value="collaborators" className="p-4">
      <Collaborators documentId={documentId} />
    </TabsContent>
    <TabsContent value="settings" className="p-4">
      {/* Settings tab content */}
      {/* ... existing settings code ... */}
    </TabsContent>
  </Tabs>
</div> 