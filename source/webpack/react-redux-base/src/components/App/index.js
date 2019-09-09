import React, { Component, Fragment, createRef } from 'react';
import { connect } from 'react-redux';
import { mapStateToProps } from '../../redux/selector/mapState';
import { mapDispatchToProps } from '../../redux/selector/mapDispatch';

import './index.scss';

@connect(
  mapStateToProps,
  mapDispatchToProps
)
class App extends Component {
  constructor(props) {
    super(props);

    this.ref = createRef();
    this.onAdd = this.onAdd.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onAdd() {
    const { boundActions } = this.props;
    const title = this.ref.current.value;

    if (title) {
      boundActions.add({ title });
      this.ref.current.value = '';
    }
  }

  onRemove(id) {
    const { boundActions } = this.props;
    boundActions.remove(id);
  }

  render() {
    const { todos } = this.props;

    return (
      <Fragment>
        <div>
          <input type="text" ref={this.ref} />
          <button onClick={this.onAdd}>add</button>
        </div>
        <ul>
          {todos.map(m => {
            return (
              <li key={m.get('id')}>
                <span>{m.get('title')}</span>
                <button onClick={this.onRemove.bind(this, m.get('id'))}>
                  remove
                </button>
              </li>
            );
          })}
        </ul>
      </Fragment>
    );
  }
}

export default App;
