import { db } from './firebase';
import { doc, writeBatch } from 'firebase/firestore';
import { movies as moviesData } from './data/movies';
import { snacks } from './data/snacks';
import { promos } from './data/promos';

/**
 * Este script envia os dados locais para o Firestore.
 * Use `writeBatch` para enviar os dados em lotes, o que é mais eficiente.
 */
async function seedDatabase() {
  console.log('Iniciando a população do banco de dados...');

  try {
    // // Lote para filmes (Desativado conforme solicitado)
    // const moviesBatch = writeBatch(db);
    // console.log(`Preparando ${moviesData.length} filmes...`);
    // moviesData.forEach((movie) => {
    //   const docRef = doc(db, 'movies', movie.id); // Usando o ID existente como ID do documento
    //   moviesBatch.set(docRef, movie);
    // });
    // await moviesBatch.commit();
    // console.log('✅ Coleção "movies" populada com sucesso!');

    // Lote para snacks
    const snacksBatch = writeBatch(db);
    console.log(`Preparando ${snacks.length} snacks...`);
    snacks.forEach((snack) => {
      const docRef = doc(db, 'snacks', snack.id);
      snacksBatch.set(docRef, snack);
    });
    await snacksBatch.commit();
    console.log('✅ Coleção "snacks" populada com sucesso!');

    // Lote para promoções
    const promosBatch = writeBatch(db);
    console.log(`Preparando ${promos.length} promoções...`);
    promos.forEach((promo) => {
      const docRef = doc(db, 'promos', promo.id);
      promosBatch.set(docRef, promo);
    });
    await promosBatch.commit();
    console.log('✅ Coleção "promos" populada com sucesso!');

    console.log('\nBanco de dados populado com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao popular o banco de dados:', error);
  }
}

seedDatabase();