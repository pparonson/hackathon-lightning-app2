import React, { ReactNode } from 'react';
import { Alert, Badge, Container, Dropdown, Nav, Navbar, NavLink } from 'react-bootstrap';
import Confetti from 'react-confetti';
import { observer } from 'mobx-react-lite';
import Connect from './pages/Connect';
import CreatePost from './pages/CreatePost';
import PostList from './pages/PostList';
import { useStore } from './store/Provider';

function App() {
  let nav;
  const store = useStore();

  const pages: Record<string, ReactNode> = {
    posts: <PostList />,
    create: <CreatePost />,
    connect: <Connect />,
  };

  const queryString = new URLSearchParams(window.location.search);
  const displayMode = queryString.get('mode');
  if (displayMode !== null) {
    store.displayMode = displayMode?.toString();
  }
  if (displayMode != null) {
    store.displayMode = displayMode.toString();

    if (store.displayMode === 'admin') {
      if (!store.connected)
        nav = (
          <Nav.Item>
            <NavLink onClick={store.gotoConnect}>Connect to LND</NavLink>
          </Nav.Item>
        );
      else
        nav = (
          <>
            <Navbar.Text>
              <Badge variant="info" pill className="mr-3">
                {store.balance.toLocaleString()} sats
              </Badge>
            </Navbar.Text>

            <Dropdown id="basic-nav-dropdown" alignRight>
              <Dropdown.Toggle as={NavLink}>{store.alias}</Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={store.disconnect}>Disconnect</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </>
        );
    }
  } else store.displayMode = 'user';

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="md">
        <Navbar.Brand onClick={store.gotoPosts}>Coin Rewarder</Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">{nav}</Nav>
        </Navbar.Collapse>
      </Navbar>

      <Container className="my-3">
        {store.error && (
          <Alert variant="danger" dismissible onClose={store.clearError}>
            {store.error}
          </Alert>
        )}

        {pages[store.page]}
      </Container>

      <Confetti numberOfPieces={store.makeItRain ? 1000 : 0} />
    </>
  );
}

export default observer(App);
