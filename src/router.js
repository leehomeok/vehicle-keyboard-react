import React from 'react';
import { Router, Route, Switch } from 'dva/router';
import IndexPage from './routes/IndexPage';
import SingleKeyboard from './components/demo'
import MixedKeyboard from './components/demo/mixedKeyboard'

function RouterConfig({ history }) {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/" exact component={IndexPage} />
        <Route path="/singleKeyboard" exact component={SingleKeyboard} />
        <Route path="/mixedKeyboard" exact component={MixedKeyboard} />
      </Switch>
    </Router>
  );
}

export default RouterConfig;
