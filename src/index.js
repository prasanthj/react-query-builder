import React from 'react';
import ReactDOM from 'react-dom';
import QueryBuilder from './QueryBuilder';
import './index.css';
import './QueryBuilder.css'

const fields = {
    firstName: {name: 'firstName', label: 'First Name'},
    lastName: {name: 'lastName', label: 'Last Name'},
    age: {name: 'age', label: 'Age'},
    address: {name: 'address', label: 'Address'},
    phone: {name: 'phone', label: 'Phone'},
    email: {name: 'email', label: 'Email'},
    twitter: {name: 'twitter', label: 'Twitter'},
    isDev: {name: 'isDev', label: 'Is a Developer?', value: false},
};

function logQuery(query) {
    console.log(query);
}

ReactDOM.render(
  <QueryBuilder fields={fields} isSQL={true} onQueryChange={logQuery}/>,
  document.getElementById('root')
);
