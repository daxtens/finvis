% if username:
<p>Hello, {{username}}. (Log out)</p>
% else:
<p>Hello! Log in | Register</p>
% for entity in user_entities:
    <p>{{entity.name}} ({{entity.id}})</p>
% end
% for entity in public_entities:
    <p>{{entity.name}} ({{entity.id}})</p>
% end