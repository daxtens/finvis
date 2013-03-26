% ecount = entities.count()
<p>Number of entities: {{ ecount }} - Create New Entity</p>
% for entity in entities:
    <p>{{entity.name}} - Edit - Delete</p>
% end