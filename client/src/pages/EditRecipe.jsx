import React, { Component } from 'react';
import makeRequest, { HTTP_METHOD } from '../services/makeRequest';
import { Spinner } from '../styles';
import { Button, Form } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle, faPlus } from '@fortawesome/free-solid-svg-icons';
import { Layout } from '../components';

class EditRecipePage extends Component
{
  state = {
    recipe: null,
    ingredients: null,
    errorMessage: null,
    redirect: false,
    
    formData: {
      name: '',
      pictureUrl: '',
      instructions: '',
      ingredients: [],
    }
  }

  componentDidMount = () => {
    const { id } = this.props.match.params;

    makeRequest(`/ingredients`)
    .then(
      response => this.setState({ ingredients: response.data })
    )
    .catch(
      error => this.setState({ errorMessage: 'Erreur durant la récupération des ingrédients.' })
    )

    if (typeof id !== 'undefined') {
      makeRequest(`/recipes/${id}`)
      .then(
        response => {
          const recipe = response.data;
          this.setState({
            recipe,
            formData: {
              name: recipe.name,
              pictureUrl: recipe.pictureUrl,
              instructions: recipe.instructions,
              ingredients: recipe.recipeIngredients.map(
                recipeIngredient => ({
                  id: recipeIngredient.ingredient.id,
                  measure: recipeIngredient.measure,
                })
              )
            }
          });
        }
      )
      .catch(
        error => this.setState({ errorMessage: 'Erreur durant la récupération de la recette.' })
      )
    }
  }

  handleTextChange = (propName) => (event) => {
    const { formData } = this.state;
    this.setState({ formData: {...formData, [propName]: event.target.value} });
  }

  handleIngredientTypeChange = (index) => (event) => {
    const { formData } = this.state;
    const { ingredients } = formData;
    ingredients[index].id = Number(event.target.value);
    this.setState({ formData: {...formData, ingredients} });
  }

  handleIngredientMeasureChange = (index) => (event) => {
    const { formData } = this.state;
    const { ingredients } = formData;
    ingredients[index].measure = event.target.value;
    this.setState({ formData: {...formData, ingredients} });
  }

  addIngredient = () => {
    const { formData } = this.state;
    const { ingredients } = formData;
    this.setState({
      formData: {
        ...formData,
        ingredients: [
          ...ingredients,
          {
            id: this.state.ingredients[0].id,
            measure: '',
          },
        ],
      },
    });
  }

  removeIngredient = (indexToRemove) => () => {
    const { formData } = this.state;
    const { ingredients } = formData;
    this.setState({
      formData: {
        ...formData,
        ingredients: ingredients.filter(
          (ingredient, index) => index !== indexToRemove
        ),
      },
    });
  }

  sendRecipe = (data) => {
    const { id } = this.props.match.params;

    let request;
    if (typeof id === 'undefined') {
      request = makeRequest('/recipes/', HTTP_METHOD.POST, data);
    } else {
      request = makeRequest(`/recipes/${id}`, HTTP_METHOD.PUT, data);
    }

    request
    .then(
      response => this.setState({ redirect: true })
    )
    .catch(
      error => this.setState({ errorMessage: 'Erreur durant l\'envoi de la recette.' })
    )
  }

  submitRecipe = (event) => {
    const { formData } = this.state;
    event.preventDefault();
    this.sendRecipe(formData);
  }

  getIngredient = (ingredientId) => {
    const { ingredients } = this.state;
    for (const ingredient of ingredients) {
      if (ingredient.id === ingredientId) {
        return ingredient;
      }
    }
    return null;
  }

  render = () => {
    const { id } = this.props.match.params;
    const { recipe, ingredients, errorMessage, redirect, formData } = this.state;
    
    if (redirect) {
      return <Redirect to="/" />;
    }

    return (
      <Layout errorMessage={errorMessage}>
        {typeof id !== 'undefined' && (recipe === null || ingredients === null) ?
          <Spinner />
          :
          <Form onSubmit={this.submitRecipe}>
            <h1 className="mt-4 mb-4">
              {typeof id === 'undefined' ?
                'Créer une nouvelle recette'
                :
                'Modifier une recette'
              }
            </h1>
            <Form.Group>
              <Form.Label>Nom de la recette</Form.Label>
              <Form.Control placeholder="Nom de la recette" value={formData.name} onChange={this.handleTextChange('name')} />
            </Form.Group>
            <Form.Group>
              <Form.Label>URL de l'image</Form.Label>
              <Form.Control placeholder="URL de l'image" value={formData.pictureUrl} onChange={this.handleTextChange('pictureUrl')} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Ingrédients</Form.Label>
              <Button variant="success" size="sm" className="d-block mb-2" onClick={this.addIngredient}>
                <FontAwesomeIcon icon={faPlus} />
                {' '}Ajouter
              </Button>
              <ul>
                {formData.ingredients.map( (ingredient, index) =>
                  <li key={index} style={{ listStyle: 'none' }} className="d-flex mb-2">
                    <Form.Control as="select" value={ingredient.id} onChange={this.handleIngredientTypeChange(index)}>
                      {ingredients.map( (possibleIngredient, index) =>
                        <option value={possibleIngredient.id} key={index}>
                          {possibleIngredient.name}
                        </option>
                      )}
                    </Form.Control>
                    <Form.Control placeholder="Mesure" value={ingredient.measure} onChange={this.handleIngredientMeasureChange(index)} />
                    <Button variant="danger" size="sm" onClick={this.removeIngredient(index)}>
                      <FontAwesomeIcon icon={faTimesCircle} />
                    </Button>
                  </li>
                )}
              </ul>
            </Form.Group>
            <Form.Group>
              <Form.Label>Instructions</Form.Label>
              <Form.Control placeholder="Instructions" as="textarea" rows="6" value={formData.instructions} onChange={this.handleTextChange('instructions')} />
            </Form.Group>
            <Button type="submit">Valider</Button>
          </Form>
        }
      </Layout>
    );
  }
}

export default EditRecipePage;
