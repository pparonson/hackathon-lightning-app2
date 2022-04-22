import React, { useCallback, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import { useStore } from '../store/Provider';

const CreatePost: React.FC = () => {
  const store = useStore();

  const [username, setUsername] = useState('');
  const [title, setTitle] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [agentId, setAgentId] = useState('');
  const [invoice, setInvoice] = useState('');

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLElement>) => {
      e.preventDefault();
      store.createPost(username, title, customerId, agentId, invoice);
    },
    [username, title, customerId, agentId, invoice, store],
  );

  return (
    <Form onSubmit={handleSubmit}>
      <Card>
        <Card.Header>Create a new Post</Card.Header>
        <Card.Body>
          <Form.Group controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              required
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="title">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="title">
            <Form.Label>Customer ID</Form.Label>
            <Form.Control
              required
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="title">
            <Form.Label>Agent ID</Form.Label>
            <Form.Control
              required
              value={agentId}
              onChange={e => setAgentId(e.target.value)}
            />
          </Form.Group>
          <Form.Group controlId="title">
            <Form.Label>Invoice</Form.Label>
            <Form.Control
              required
              as="textarea"
              rows={8}
              value={invoice}
              onChange={e => setInvoice(e.target.value)}
            />
          </Form.Group>
        </Card.Body>
        <Card.Footer>
          <Row>
            <Col>
              <Button variant="outline-danger" onClick={store.gotoPosts}>
                Cancel
              </Button>
            </Col>
            <Col className="text-right">
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Footer>
      </Card>
    </Form>
  );
};

export default observer(CreatePost);
