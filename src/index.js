import React from 'react';
import ReactDOM from 'react-dom';
import {QueryBuilder} from 'react-querybuilder';
import './index.css';

const fields = [
    {name: 'firstName', label: 'First Name'},
    {name: 'lastName', label: 'Last Name'},
    {name: 'age', label: 'Age'},
    {name: 'address', label: 'Address'},
    {name: 'phone', label: 'Phone'},
    {name: 'email', label: 'Email'},
    {name: 'twitter', label: 'Twitter'},
    {name: 'isDev', label: 'Is a Developer?', value: false},
];

function logQuery(query) {
    console.log(query);
}

ReactDOM.render(
  <QueryBuilder fields={fields}
                          onQueryChange={logQuery}/>,
  document.getElementById('root')
);