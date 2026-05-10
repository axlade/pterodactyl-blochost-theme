import React, { useEffect, useRef, useState } from 'react';
import { Link, RouteComponentProps } from 'react-router-dom';
import login from '@/api/auth/login';
import LoginFormContainer from '@/components/auth/LoginFormContainer';
import { useStoreState } from 'easy-peasy';
import { Formik, FormikHelpers } from 'formik';
import { object, string } from 'yup';
import Field from '@/components/elements/Field';
import tw from 'twin.macro';
import Button from '@/components/elements/Button';
import Reaptcha from 'reaptcha';
import useFlash from '@/plugins/useFlash';

const F = "'Sora', sans-serif";

interface Values {
    username: string;
    password: string;
}

const LoginContainer = ({ history }: RouteComponentProps) => {
    const ref = useRef<Reaptcha>(null);
    const [token, setToken] = useState('');

    const { clearFlashes, clearAndAddHttpError } = useFlash();
    const { enabled: recaptchaEnabled, siteKey } = useStoreState((state) => state.settings.data!.recaptcha);

    useEffect(() => { clearFlashes(); }, []);

    const onSubmit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes();

        if (recaptchaEnabled && !token) {
            ref.current!.execute().catch((error) => {
                console.error(error);
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
            return;
        }

        login({ ...values, recaptchaData: token })
            .then((response) => {
                if (response.complete) {
                    // @ts-expect-error this is valid
                    window.location = response.intended || '/';
                    return;
                }
                history.replace('/auth/login/checkpoint', { token: response.confirmationToken });
            })
            .catch((error) => {
                console.error(error);
                setToken('');
                if (ref.current) ref.current.reset();
                setSubmitting(false);
                clearAndAddHttpError({ error });
            });
    };

    return (
        <Formik
            onSubmit={onSubmit}
            initialValues={{ username: '', password: '' }}
            validationSchema={object().shape({
                username: string().required('Un identifiant ou email est requis.'),
                password: string().required('Le mot de passe est requis.'),
            })}
        >
            {({ isSubmitting, setSubmitting, submitForm }) => (
                <LoginFormContainer title={'Login to Continue'}>
                    <Field
                        type={'text'}
                        label={'Identifiant ou Email'}
                        name={'username'}
                        disabled={isSubmitting}
                    />
                    <Field
                        type={'password'}
                        label={'Mot de passe'}
                        name={'password'}
                        disabled={isSubmitting}
                    />
                    <div style={{ marginTop: '0.5rem' }}>
                        <Button
                            type={'submit'}
                            size={'xlarge'}
                            isLoading={isSubmitting}
                            disabled={isSubmitting}
                            style={{ width: '100%', fontFamily: F, fontWeight: 700, letterSpacing: '0.04em', borderRadius: '10px' }}
                        >
                            Se connecter
                        </Button>
                    </div>
                    {recaptchaEnabled && (
                        <Reaptcha
                            ref={ref}
                            size={'invisible'}
                            sitekey={siteKey || '_invalid_key'}
                            onVerify={(response) => { setToken(response); submitForm(); }}
                            onExpire={() => { setSubmitting(false); setToken(''); }}
                        />
                    )}
                    <div style={{ textAlign: 'center', marginTop: '0.25rem' }}>
                        <Link
                            to={'/auth/password'}
                            style={{ fontSize: '0.75rem', color: '#555', textDecoration: 'none', fontFamily: F, transition: 'color 0.15s' }}
                            onMouseEnter={e => (e.currentTarget.style.color = '#FF7D20')}
                            onMouseLeave={e => (e.currentTarget.style.color = '#555')}
                        >
                            Mot de passe oublié ?
                        </Link>
                    </div>
                </LoginFormContainer>
            )}
        </Formik>
    );
};

export default LoginContainer;
