import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import servicesData from "../data/services";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Container,
  Stack,
  Form,
  Button,
  ListGroup,
  Alert,
} from "react-bootstrap";

export default function HealthServices() {
  const queryClient = useQueryClient();
  const lastIdRef = useRef(
    servicesData.length > 0 ? Math.max(...servicesData.map((s) => s.id)) : 0
  );

  const [newService, setNewService] = useState({
    name: "",
    description: "",
    price: "",
  });
  const [editingService, setEditingService] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Fetch services - simulate an API request
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["services"],
    queryFn: () => servicesData,
  });

  // Mutation to add a new service
  const addServiceMutation = useMutation({
    mutationFn: (newService) => {
      lastIdRef.current += 1;
      const service = { ...newService, id: lastIdRef.current };
      servicesData.push(service); // Simulating adding a new service
      return service;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      showSuccessMessage("Service added successfully!");
    },
  });

  // Mutation to edit a service
  const editServiceMutation = useMutation({
    mutationFn: (updatedService) => {
      const index = servicesData.findIndex((s) => s.id === updatedService.id);
      if (index !== -1) {
        servicesData[index] = updatedService;
      }
      return updatedService;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      showSuccessMessage("Service updated successfully!");
    },
  });

  // Mutation to delete a service
  const deleteServiceMutation = useMutation({
    mutationFn: (serviceId) => {
      const index = servicesData.findIndex((s) => s.id === serviceId);
      if (index !== -1) {
        servicesData.splice(index, 1);
      }
      return serviceId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      showSuccessMessage("Service deleted successfully!");
    },
  });

  // Handle form submission to add or edit a service
  const handleSubmit = (e) => {
    e.preventDefault();
    if (newService.name && newService.description && newService.price) {
      if (editingService) {
        editServiceMutation.mutate({ ...newService, id: editingService.id });
        setEditingService(null);
      } else {
        addServiceMutation.mutate(newService);
      }
      setNewService({ name: "", description: "", price: "" });
    }
  };

  // Handle edit button click
  const handleEdit = (service) => {
    setEditingService(service);
    setNewService({
      name: service.name,
      description: service.description,
      price: service.price,
    });
  };

  // Handle delete button click
  const handleDelete = (serviceId) => {
    if (window.confirm("Are you sure you want to delete this service?")) {
      deleteServiceMutation.mutate(serviceId);
    }
  };

  // Show success message
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (isError) {
    return <h1>Error: {error.message}</h1>;
  }

  if (!data || data.length === 0) {
    return <h1>No services available</h1>;
  }

  return (
    <Container>
      <h1>Healthcare Services</h1>

      {showSuccess && <Alert variant="success">{successMessage}</Alert>}

      {/* List of services */}
      <ListGroup className="mt-4 gap-3">
        {data.map((service) => (
          <ListGroup.Item key={service.id} className="mb-3 py-3">
            <Stack
              direction="horizontal"
              gap={3}
              className="justify-content-between align-items-center flex-wrap"
            >
              <div>
                <h5 className="mb-1">{service.name}</h5>
                <p className="mb-1">{service.description}</p>
                <small>Price: ${service.price}</small>
              </div>
              <Stack
                direction="horizontal"
                gap={2}
                className="align-items-center"
              >
                <Button
                  variant="outline-primary"
                  onClick={() => handleEdit(service)}
                >
                  Edit
                </Button>
                <Button
                  variant="outline-danger"
                  onClick={() => handleDelete(service.id)}
                >
                  Delete
                </Button>
              </Stack>
            </Stack>
          </ListGroup.Item>
        ))}
      </ListGroup>

      {/* Form to add/edit service */}
      <h2 className="mt-5">
        {editingService ? "Edit Service" : "Add New Service"}
      </h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formServiceName" className="mb-3">
          <Form.Label>Service Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter service name"
            value={newService.name}
            onChange={(e) =>
              setNewService({ ...newService, name: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group controlId="formServiceDescription" className="mb-3">
          <Form.Label>Service Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter service description"
            value={newService.description}
            onChange={(e) =>
              setNewService({ ...newService, description: e.target.value })
            }
            required
          />
        </Form.Group>

        <Form.Group controlId="formServicePrice" className="mb-3">
          <Form.Label>Service Price</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter service price"
            value={newService.price}
            onChange={(e) =>
              setNewService({ ...newService, price: e.target.value })
            }
            required
          />
        </Form.Group>

        <div className="d-grid gap-2">
          <Button variant="primary" type="submit">
            {editingService ? "Update Service" : "Add Service"}
          </Button>
          {editingService && (
            <Button
              variant="secondary"
              onClick={() => {
                setEditingService(null);
                setNewService({ name: "", description: "", price: "" });
              }}
            >
              Cancel Edit
            </Button>
          )}
        </div>
      </Form>
    </Container>
  );
}
